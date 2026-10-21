import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

// GET /api/reports/products-summary - Full product catalog report
router.get("/products-summary", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { sku: "asc" },
      include: {
        category: true,
        inventory: true,
        _count: {
          select: { bomRevisions: true, productSpecifications: true },
        },
      },
    });

    const report = products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category?.name,
      variant: p.variant || "-",
      modelName: p.modelName || "-",
      hsnCode: p.hsnCode,
      gstPercent: Number(p.gstPercent),
      listPrice: Number(p.listPrice),
      unitOfMeasure: p.unitOfMeasure,
      isManufactured: p.isManufactured ? "YES" : "NO",
      drawingId: p.drawingId || "-",
      physicalStock: Number(p.inventory?.physicalQuantity || 0),
      reservedStock: Number(p.inventory?.reservedQuantity || 0),
      availableStock: Math.max(0, Number(p.inventory?.physicalQuantity || 0) - Number(p.inventory?.reservedQuantity || 0)),
      bomCount: p._count.bomRevisions,
      specCount: p._count.productSpecifications,
    }));

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/bom-costing - BOM Cost Rollup Summary
router.get("/bom-costing", async (req, res) => {
  try {
    const boms = await prisma.bOMRevision.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { sku: true, name: true, listPrice: true, unitOfMeasure: true } },
        items: true,
        operations: true,
      },
    });

    const report = boms.map((b) => {
      const mat = Number(b.materialCost);
      const lab = Number(b.laborCost);
      const ovh = Number(b.overheadCost);
      const totalCost = mat + lab + ovh;
      const listPrice = Number(b.product?.listPrice || 0);
      const margin = listPrice > 0 ? (((listPrice - totalCost) / listPrice) * 100).toFixed(1) : null;

      return {
        id: b.id,
        bomRevision: b.revision,
        productSku: b.product?.sku,
        productName: b.product?.name,
        status: b.status,
        componentsCount: b.items.length,
        operationsCount: b.operations.length,
        materialCost: mat,
        laborCost: lab,
        overheadCost: ovh,
        totalCost,
        sellingPrice: listPrice,
        marginPercent: margin ? `${margin}%` : "N/A",
      };
    });

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
