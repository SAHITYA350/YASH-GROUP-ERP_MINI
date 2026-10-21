import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

// GET /api/traceability/:identifier - Full lifecycle traceability chain
router.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    let product = null;

    if (!isNaN(parseInt(identifier, 10))) {
      product = await prisma.product.findUnique({
        where: { id: parseInt(identifier, 10) },
        include: {
          category: true,
          productSpecifications: { orderBy: { createdAt: "desc" } },
          bomRevisions: {
            include: {
              items: { include: { component: true } },
              operations: true,
            },
          },
          mediaAssets: true,
          inventory: true,
        },
      });
    }

    if (!product) {
      product = await prisma.product.findUnique({
        where: { sku: identifier.trim().toUpperCase() },
        include: {
          category: true,
          productSpecifications: { orderBy: { createdAt: "desc" } },
          bomRevisions: {
            include: {
              items: { include: { component: true } },
              operations: true,
            },
          },
          mediaAssets: true,
          inventory: true,
        },
      });
    }

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found for traceability inquiry" });
    }

    // Find Sales Order Items for this product
    const salesOrderItems = await prisma.salesOrderItem.findMany({
      where: { productId: product.id },
      include: {
        salesOrder: {
          include: {
            customer: true,
            workOrders: {
              include: {
                inspections: true,
              },
            },
            projects: true,
          },
        },
      },
    });

    // Find Work Orders for this product
    const workOrderItems = await prisma.workOrderItem.findMany({
      where: { productId: product.id },
      include: {
        workOrder: {
          include: {
            salesOrder: { include: { customer: true } },
            inspections: true,
          },
        },
      },
    });

    // Assemble unified traceability timeline & relationship graph
    const timeline = [];

    // 1. Product creation
    timeline.push({
      stage: "PRODUCT_DEFINITION",
      title: `Product Master Defined: ${product.sku}`,
      date: product.createdAt,
      status: "COMPLETED",
      details: `${product.name} registered under ${product.category?.name}. Standard Make: ${product.standardMake}`,
    });

    // 2. Specifications
    for (const spec of product.productSpecifications) {
      timeline.push({
        stage: "SPECIFICATION_RELEASE",
        title: `Technical Spec ${spec.revision} (${spec.status})`,
        date: spec.createdAt,
        status: spec.status,
        details: `Drawing Number: ${spec.drawingNumber || "N/A"}. Released: ${spec.releasedAt ? new Date(spec.releasedAt).toLocaleDateString() : "Pending"}`,
      });
    }

    // 3. BOM Revisions
    for (const bom of product.bomRevisions) {
      timeline.push({
        stage: "BOM_ENGINEERING",
        title: `Manufacturing BOM ${bom.revision} (${bom.status})`,
        date: bom.createdAt,
        status: bom.status,
        details: `Components: ${bom.items.length} lines | Operations: ${bom.operations.length} steps | Est. Unit Cost: ₹${Number(bom.materialCost) + Number(bom.laborCost) + Number(bom.overheadCost)}`,
      });
    }

    // 4. Sales Orders
    for (const soi of salesOrderItems) {
      timeline.push({
        stage: "COMMERCIAL_ORDER",
        title: `Sales Order ${soi.salesOrder.orderNumber}`,
        date: soi.salesOrder.orderDate,
        status: soi.salesOrder.status,
        details: `Customer: ${soi.salesOrder.customer?.name} | Ordered: ${Number(soi.quantity)} ${product.unitOfMeasure} | PO: ${soi.salesOrder.customerPONumber || "N/A"}`,
      });

      // Work orders under this SO
      for (const wo of soi.salesOrder.workOrders || []) {
        timeline.push({
          stage: "PLANT_PRODUCTION",
          title: `Work Order ${wo.workOrderNo} (${wo.status})`,
          date: wo.createdAt,
          status: wo.status,
          details: `Planned: ${Number(wo.plannedQuantity)} | Good Yield: ${Number(wo.goodQuantity)} | Rejected: ${Number(wo.rejectedQuantity)} | Priority: ${wo.priority}`,
        });

        for (const qc of wo.inspections || []) {
          timeline.push({
            stage: "QUALITY_ASSURANCE",
            title: `Quality Inspection ${qc.inspectionNo}`,
            date: qc.createdAt,
            status: qc.status,
            details: `Inspected: ${Number(qc.inspectedQuantity)} | Accepted: ${Number(qc.acceptedQuantity)} | Status: ${qc.status}`,
          });
        }
      }

      // Projects
      for (const prj of soi.salesOrder.projects || []) {
        timeline.push({
          stage: "EPC_SITE_PROJECT",
          title: `Site Project ${prj.projectCode}`,
          date: prj.createdAt,
          status: prj.status,
          details: `${prj.name} | Site: ${prj.siteName || "N/A"}`,
        });
      }
    }

    // Sort timeline chronologically
    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.json({
      success: true,
      data: {
        product: {
          id: product.id,
          sku: product.sku,
          name: product.name,
          category: product.category?.name,
          unitOfMeasure: product.unitOfMeasure,
          listPrice: product.listPrice,
          drawingId: product.drawingId,
          imageUrl: product.imageUrl,
          stock: product.inventory ? {
            physical: Number(product.inventory.physicalQuantity),
            reserved: Number(product.inventory.reservedQuantity),
            available: Math.max(0, Number(product.inventory.physicalQuantity) - Number(product.inventory.reservedQuantity)),
          } : null,
        },
        specifications: product.productSpecifications,
        boms: product.bomRevisions,
        salesOrders: salesOrderItems.map((so) => ({
          orderNumber: so.salesOrder.orderNumber,
          customer: so.salesOrder.customer?.name,
          orderDate: so.salesOrder.orderDate,
          quantity: Number(so.quantity),
          status: so.salesOrder.status,
        })),
        workOrders: workOrderItems.map((wo) => ({
          workOrderNo: wo.workOrder.workOrderNo,
          status: wo.workOrder.status,
          planned: Number(wo.workOrder.plannedQuantity),
          good: Number(wo.workOrder.goodQuantity),
        })),
        timeline,
      },
    });
  } catch (err) {
    console.error("Traceability inquiry error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
