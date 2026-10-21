import { Router } from "express";
import { prisma } from "../db.js";
import { validateBOMCreate } from "../validators/engineering.validator.js";

const router = Router();

// GET /api/boms - List all BOM revisions
router.get("/", async (req, res) => {
  try {
    const { productId, status } = req.query;
    const where = {};
    if (productId) where.productId = parseInt(productId, 10);
    if (status) where.status = status;

    const boms = await prisma.bOMRevision.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { id: true, sku: true, name: true, unitOfMeasure: true, listPrice: true },
        },
        items: {
          include: {
            component: {
              select: { id: true, sku: true, name: true, unitOfMeasure: true, listPrice: true },
            },
          },
        },
        operations: {
          orderBy: { sequence: "asc" },
        },
        _count: {
          select: { items: true, operations: true, workOrders: true },
        },
      },
    });

    res.json({ success: true, data: boms });
  } catch (err) {
    console.error("Fetch BOMs error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/boms/:id - Single BOM revision detail
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, error: "Invalid BOM ID" });

    const bom = await prisma.bOMRevision.findUnique({
      where: { id },
      include: {
        product: {
          include: { category: true, inventory: true },
        },
        items: {
          include: {
            component: {
              include: { inventory: true, category: true },
            },
          },
        },
        operations: {
          orderBy: { sequence: "asc" },
        },
      },
    });

    if (!bom) return res.status(404).json({ success: false, error: "BOM revision not found" });

    res.json({ success: true, data: bom });
  } catch (err) {
    console.error("BOM detail error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/boms - Create a new BOM revision
router.post("/", validateBOMCreate, async (req, res) => {
  try {
    const { productId, revision, status = "DRAFT", notes, items = [], operations = [] } = req.body;

    if (!productId || !revision) {
      return res.status(400).json({ success: false, error: "Product ID and revision identifier are required." });
    }

    const prodId = parseInt(productId, 10);
    const rev = revision.trim().toUpperCase();

    // Check duplicate
    const existing = await prisma.bOMRevision.findUnique({
      where: {
        productId_revision: {
          productId: prodId,
          revision: rev,
        },
      },
    });

    if (existing) {
      return res.status(409).json({ success: false, error: `BOM revision ${rev} already exists for this product.` });
    }

    // Calculate initial material cost from items if component prices exist
    let calculatedMatCost = 0;
    for (const it of items) {
      const comp = await prisma.product.findUnique({ where: { id: parseInt(it.componentProductId, 10) } });
      if (comp) {
        const qty = parseFloat(it.quantity) || 0;
        const scrap = parseFloat(it.scrapPercent) || 0;
        const grossQty = qty * (1 + scrap / 100);
        calculatedMatCost += grossQty * Number(comp.listPrice || 0);
      }
    }

    // Calculate labor cost from operations (assuming avg manufacturing labor rate of ₹350/hr)
    let calculatedLaborCost = 0;
    const HOURLY_LABOR_RATE = 350.0;
    for (const op of operations) {
      const mins = parseFloat(op.standardMinutes) || 0;
      calculatedLaborCost += (mins / 60.0) * HOURLY_LABOR_RATE;
    }

    const overheadCost = (calculatedMatCost + calculatedLaborCost) * 0.12; // 12% factory overhead default

    const created = await prisma.bOMRevision.create({
      data: {
        productId: prodId,
        revision: rev,
        status: status || "DRAFT",
        notes: notes || null,
        materialCost: calculatedMatCost,
        laborCost: calculatedLaborCost,
        overheadCost: overheadCost,
        releasedAt: status === "RELEASED" ? new Date() : null,
        items: {
          create: items.map((it) => ({
            componentProductId: parseInt(it.componentProductId, 10),
            quantity: parseFloat(it.quantity),
            scrapPercent: it.scrapPercent ? parseFloat(it.scrapPercent) : 0,
          })),
        },
        operations: {
          create: operations.map((op, idx) => ({
            sequence: op.sequence ? parseInt(op.sequence, 10) : (idx + 1) * 10,
            name: op.name,
            workCenter: op.workCenter || null,
            standardMinutes: op.standardMinutes ? parseFloat(op.standardMinutes) : null,
            instructions: op.instructions || null,
          })),
        },
      },
      include: {
        product: true,
        items: { include: { component: true } },
        operations: true,
      },
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("Create BOM error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/boms/:id - Update BOM details, lines, and operations
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, notes, items, operations } = req.body;

    const existing = await prisma.bOMRevision.findUnique({
      where: { id },
      include: { items: true, operations: true },
    });

    if (!existing) return res.status(404).json({ success: false, error: "BOM revision not found" });

    // In a transactional update, replace items & operations if provided
    await prisma.$transaction(async (tx) => {
      if (items && Array.isArray(items)) {
        await tx.bOMItem.deleteMany({ where: { bomRevisionId: id } });
        if (items.length > 0) {
          await tx.bOMItem.createMany({
            data: items.map((it) => ({
              bomRevisionId: id,
              componentProductId: parseInt(it.componentProductId, 10),
              quantity: parseFloat(it.quantity),
              scrapPercent: it.scrapPercent ? parseFloat(it.scrapPercent) : 0,
            })),
          });
        }
      }

      if (operations && Array.isArray(operations)) {
        await tx.bOMOperation.deleteMany({ where: { bomRevisionId: id } });
        if (operations.length > 0) {
          await tx.bOMOperation.createMany({
            data: operations.map((op, idx) => ({
              bomRevisionId: id,
              sequence: op.sequence ? parseInt(op.sequence, 10) : (idx + 1) * 10,
              name: op.name,
              workCenter: op.workCenter || null,
              standardMinutes: op.standardMinutes ? parseFloat(op.standardMinutes) : null,
              instructions: op.instructions || null,
            })),
          });
        }
      }

      // Re-rollup costs
      const updatedItems = await tx.bOMItem.findMany({
        where: { bomRevisionId: id },
        include: { component: true },
      });
      const updatedOps = await tx.bOMOperation.findMany({
        where: { bomRevisionId: id },
      });

      let matCost = 0;
      for (const it of updatedItems) {
        const grossQty = Number(it.quantity) * (1 + Number(it.scrapPercent) / 100);
        matCost += grossQty * Number(it.component.listPrice || 0);
      }

      let laborCost = 0;
      for (const op of updatedOps) {
        const mins = Number(op.standardMinutes || 0);
        laborCost += (mins / 60.0) * 350.0;
      }

      const overheadCost = (matCost + laborCost) * 0.12;

      await tx.bOMRevision.update({
        where: { id },
        data: {
          notes: notes !== undefined ? notes : existing.notes,
          status: status || existing.status,
          releasedAt: status === "RELEASED" && !existing.releasedAt ? new Date() : existing.releasedAt,
          materialCost: matCost,
          laborCost: laborCost,
          overheadCost: overheadCost,
        },
      });
    });

    const updated = await prisma.bOMRevision.findUnique({
      where: { id },
      include: {
        product: true,
        items: { include: { component: true } },
        operations: true,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Update BOM error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/boms/:id/explosion - Recursive Multi-Level BOM Explosion with circular reference detection
router.get("/:id/explosion", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { batchQuantity = 1 } = req.query;
    const batchQty = parseFloat(batchQuantity) || 1;

    const rootBOM = await prisma.bOMRevision.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!rootBOM) return res.status(404).json({ success: false, error: "BOM not found" });

    // Recursive helper function
    async function explodeBOM(bomRevisionId, multiplier = 1, currentPath = [], depth = 1) {
      if (depth > 8) {
        throw new Error(`Maximum BOM nesting depth of 8 exceeded. Potential circular dependency detected.`);
      }

      const rev = await prisma.bOMRevision.findUnique({
        where: { id: bomRevisionId },
        include: {
          product: { select: { id: true, sku: true, name: true, unitOfMeasure: true, listPrice: true } },
          items: {
            include: {
              component: {
                include: {
                  inventory: true,
                  bomRevisions: {
                    where: { status: "RELEASED" },
                    take: 1,
                  },
                },
              },
            },
          },
          operations: { orderBy: { sequence: "asc" } },
        },
      });

      if (!rev) return null;

      const lines = [];

      for (const item of rev.items) {
        const comp = item.component;
        if (currentPath.includes(comp.id)) {
          throw new Error(`Circular reference detected: Product ${comp.sku} is already an ancestor in the assembly path.`);
        }

        const netQty = Number(item.quantity) * multiplier;
        const grossQty = netQty * (1 + Number(item.scrapPercent) / 100);
        const unitCost = Number(comp.inventory?.unitCost || comp.listPrice || 0);
        const extendedCost = grossQty * unitCost;

        const hasSubAssembly = comp.bomRevisions && comp.bomRevisions.length > 0;
        let subExplosion = null;

        if (hasSubAssembly) {
          subExplosion = await explodeBOM(
            comp.bomRevisions[0].id,
            grossQty,
            [...currentPath, comp.id],
            depth + 1
          );
        }

        lines.push({
          level: depth,
          componentId: comp.id,
          sku: comp.sku,
          name: comp.name,
          unitOfMeasure: comp.unitOfMeasure,
          quantityPerAssembly: Number(item.quantity),
          scrapPercent: Number(item.scrapPercent),
          requiredGrossQuantity: grossQty,
          unitCost,
          extendedCost,
          onHandStock: Number(comp.inventory?.physicalQuantity || 0),
          reservedStock: Number(comp.inventory?.reservedQuantity || 0),
          availableStock: Math.max(0, Number(comp.inventory?.physicalQuantity || 0) - Number(comp.inventory?.reservedQuantity || 0)),
          isShortage: grossQty > Math.max(0, Number(comp.inventory?.physicalQuantity || 0) - Number(comp.inventory?.reservedQuantity || 0)),
          isSubAssembly: hasSubAssembly,
          subBOM: subExplosion,
        });
      }

      return {
        product: rev.product,
        revision: rev.revision,
        lines,
      };
    }

    const explosion = await explodeBOM(id, batchQty, [rootBOM.productId], 1);

    res.json({
      success: true,
      data: {
        rootProduct: rootBOM.product,
        batchQuantity: batchQty,
        explosion,
      },
    });
  } catch (err) {
    console.error("BOM Explosion error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/boms/:id/simulate - Authoritative backend costing & price sensitivity simulation
router.post("/:id/simulate", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      materialAdjustmentPercent = 0, // e.g. +5% copper spike
      laborHourlyRate = 350.0,
      overheadPercent = 12.0,
      targetSellingPrice = null,
      targetMarginPercent = null,
      batchSize = 1,
    } = req.body;

    const bom = await prisma.bOMRevision.findUnique({
      where: { id },
      include: {
        product: true,
        items: { include: { component: { include: { inventory: true } } } },
        operations: true,
      },
    });

    if (!bom) return res.status(404).json({ success: false, error: "BOM not found" });

    // 1. Calculate baseline material cost
    let baselineMaterialCost = 0;
    const itemCostDetails = bom.items.map((it) => {
      const grossQty = Number(it.quantity) * (1 + Number(it.scrapPercent) / 100);
      const unitRate = Number(it.component.inventory?.unitCost || it.component.listPrice || 0);
      const lineCost = grossQty * unitRate;
      baselineMaterialCost += lineCost;
      return {
        sku: it.component.sku,
        name: it.component.name,
        grossQuantity: grossQty,
        unitRate,
        lineCost,
      };
    });

    // 2. Adjust material cost
    const simulatedMaterialCost = baselineMaterialCost * (1 + parseFloat(materialAdjustmentPercent) / 100);

    // 3. Calculate process / labor cost
    let totalMinutes = 0;
    for (const op of bom.operations) {
      totalMinutes += Number(op.standardMinutes || 0);
    }
    const laborRate = parseFloat(laborHourlyRate) || 350.0;
    const simulatedLaborCost = (totalMinutes / 60.0) * laborRate;

    // 4. Overhead
    const ovhPct = parseFloat(overheadPercent) || 12.0;
    const simulatedOverhead = (simulatedMaterialCost + simulatedLaborCost) * (ovhPct / 100);

    // 5. Total Unit Manufacturing Cost
    const totalUnitCost = simulatedMaterialCost + simulatedLaborCost + simulatedOverhead;

    // 6. Margin & Price Calculations
    let finalSellingPrice = targetSellingPrice !== null ? parseFloat(targetSellingPrice) : Number(bom.product.listPrice || 0);
    let calculatedMarginPercent = null;
    let profitPerUnit = null;

    if (targetMarginPercent !== null && parseFloat(targetMarginPercent) > 0) {
      // Selling price = Cost / (1 - Margin/100)
      const marginDecimal = parseFloat(targetMarginPercent) / 100;
      if (marginDecimal < 1) {
        finalSellingPrice = totalUnitCost / (1 - marginDecimal);
        profitPerUnit = finalSellingPrice - totalUnitCost;
        calculatedMarginPercent = parseFloat(targetMarginPercent);
      }
    } else if (finalSellingPrice > 0) {
      profitPerUnit = finalSellingPrice - totalUnitCost;
      calculatedMarginPercent = ((finalSellingPrice - totalUnitCost) / finalSellingPrice) * 100;
    }

    res.json({
      success: true,
      data: {
        productSku: bom.product.sku,
        productName: bom.product.name,
        bomRevision: bom.revision,
        costBreakdown: {
          baselineMaterialCost,
          materialAdjustmentPercent: parseFloat(materialAdjustmentPercent),
          simulatedMaterialCost,
          totalOperationMinutes: totalMinutes,
          simulatedLaborCost,
          simulatedOverhead,
          totalUnitCost,
          batchTotalCost: totalUnitCost * (parseFloat(batchSize) || 1),
        },
        commercials: {
          sellingPrice: finalSellingPrice,
          profitPerUnit,
          marginPercent: calculatedMarginPercent !== null ? parseFloat(calculatedMarginPercent.toFixed(2)) : null,
          markupPercent: totalUnitCost > 0 ? parseFloat((((finalSellingPrice - totalUnitCost) / totalUnitCost) * 100).toFixed(2)) : null,
        },
        itemCostDetails,
      },
    });
  } catch (err) {
    console.error("Cost Simulation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/boms/:id/shortages - Check shortage for a requested order/batch demand
router.get("/:id/shortages", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { orderQuantity = 100 } = req.query;
    const orderQty = parseFloat(orderQuantity) || 100;

    const bom = await prisma.bOMRevision.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            component: {
              include: { inventory: true },
            },
          },
        },
      },
    });

    if (!bom) return res.status(404).json({ success: false, error: "BOM not found" });

    const shortageReport = bom.items.map((it) => {
      const comp = it.component;
      const qtyPerUnit = Number(it.quantity);
      const scrap = Number(it.scrapPercent);
      const grossDemand = orderQty * qtyPerUnit * (1 + scrap / 100);

      const physical = Number(comp.inventory?.physicalQuantity || 0);
      const reserved = Number(comp.inventory?.reservedQuantity || 0);
      const available = Math.max(0, physical - reserved);

      const shortage = Math.max(0, grossDemand - available);

      return {
        componentId: comp.id,
        sku: comp.sku,
        name: comp.name,
        unitOfMeasure: comp.unitOfMeasure,
        quantityPerAssembly: qtyPerUnit,
        scrapPercent: scrap,
        requiredForOrder: grossDemand,
        physicalStock: physical,
        reservedStock: reserved,
        availableStock: available,
        shortageQuantity: shortage,
        isShortage: shortage > 0,
      };
    });

    res.json({
      success: true,
      data: {
        orderQuantity: orderQty,
        hasShortages: shortageReport.some((s) => s.isShortage),
        items: shortageReport,
      },
    });
  } catch (err) {
    console.error("Shortage check error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
