import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

// GET /api/dashboard - Aggregated engineering metrics & KPIs
router.get("/", async (req, res) => {
  try {
    const [
      totalProducts,
      manufacturedCount,
      activeBomsCount,
      openTasksCount,
      drawingsCount,
      trainingCount,
      inventoryItems,
      categories,
      recentProducts,
      recentTasks,
      recentDrawings,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true, isManufactured: true } }),
      prisma.bOMRevision.count({ where: { status: "RELEASED" } }),
      prisma.task.count({ where: { department: "Engineering", status: { in: ["OPEN", "IN_PROGRESS", "WAITING_APPROVAL"] } } }),
      prisma.mediaAsset.count({ where: { type: "DRAWING" } }),
      prisma.mediaAsset.count({ where: { type: "TRAINING" } }),
      prisma.inventory.findMany({
        include: { product: { select: { sku: true, name: true } } },
      }),
      prisma.category.findMany({
        include: { _count: { select: { products: true } } },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        take: 6,
        orderBy: { updatedAt: "desc" },
        include: { category: { select: { name: true } } },
      }),
      prisma.task.findMany({
        where: { department: "Engineering" },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.mediaAsset.findMany({
        where: { type: "DRAWING" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { product: { select: { sku: true, name: true } } },
      }),
    ]);

    // Calculate critical shortages: (physical - reserved) < reorderLevel
    const shortages = inventoryItems.filter((inv) => {
      const available = Number(inv.physicalQuantity) - Number(inv.reservedQuantity);
      return available < Number(inv.reorderLevel);
    });

    const categoryBreakdown = categories.map((c) => ({
      name: c.name,
      type: c.type,
      productCount: c._count.products,
    }));

    res.json({
      success: true,
      data: {
        kpis: {
          totalProducts,
          manufacturedCount,
          activeBoms: activeBomsCount,
          openTasks: openTasksCount,
          drawingsCount,
          trainingVideos: trainingCount,
          criticalShortages: shortages.length,
        },
        categoryBreakdown,
        shortageAlerts: shortages.map((s) => ({
          productId: s.productId,
          sku: s.product?.sku,
          name: s.product?.name,
          physical: Number(s.physicalQuantity),
          reserved: Number(s.reservedQuantity),
          available: Number(s.physicalQuantity) - Number(s.reservedQuantity),
          reorderLevel: Number(s.reorderLevel),
        })),
        recentProducts,
        recentTasks,
        recentDrawings,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
