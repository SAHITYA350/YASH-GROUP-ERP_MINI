import prisma from "../../../shared/database/prisma.js";

// ─────────────────────────────────────────────
// 1. GET Dashboard Summary (all 3 modules combined)
// ─────────────────────────────────────────────
export const getProductionDashboardStats = async () => {
  const [
    woStatusCounts,
    woTotals,
    qiStatusCounts,
    qiTotals,
    bomStatusCounts,
    activeWorkOrders,
    pendingInspections,
    completedThisMonth,
    delayedOrders,
    inventoryTotals,
  ] = await prisma.$transaction(
    [
      // Work order status breakdown
      prisma.workOrder.groupBy({ by: ["status"], _count: { id: true } }),
      // Work order qty aggregates
      prisma.workOrder.aggregate({
        _sum: {
          plannedQuantity: true,
          goodQuantity: true,
          rejectedQuantity: true,
        },
        _count: { id: true },
      }),
      // QI status breakdown
      prisma.qualityInspection.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      // QI qty aggregates
      prisma.qualityInspection.aggregate({
        _sum: {
          inspectedQuantity: true,
          acceptedQuantity: true,
          rejectedQuantity: true,
        },
      }),
      // BOM status breakdown
      prisma.bOMRevision.groupBy({ by: ["status"], _count: { id: true } }),
      // Active work orders (IN_PROGRESS)
      prisma.workOrder.findMany({
        where: { status: { in: ["IN_PROGRESS", "RELEASED", "QC_HOLD"] } },
        include: {
          salesOrder: {
            select: {
              orderNumber: true,
              customer: { select: { name: true } },
            },
          },
        },
        orderBy: { plannedEnd: "asc" },
        take: 5,
      }),
      // Pending quality inspections
      prisma.qualityInspection.findMany({
        where: { status: { in: ["PENDING", "HOLD"] } },
        include: {
          workOrder: {
            select: {
              workOrderNo: true,
              salesOrder: {
                select: {
                  orderNumber: true,
                  customer: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      // Completed this month
      prisma.workOrder.count({
        where: {
          status: "COMPLETED",
          actualEnd: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.workOrder.count({
        where: {
          plannedEnd: { lt: new Date() },
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        },
      }),
      prisma.inventory.aggregate({
        _sum: { physicalQuantity: true, reservedQuantity: true },
      }),
    ],
    { maxWait: 15_000, timeout: 30_000 },
  );

  const woByStatus = Object.fromEntries(
    woStatusCounts.map((r) => [r.status, r._count.id]),
  );
  const qiByStatus = Object.fromEntries(
    qiStatusCounts.map((r) => [r.status, r._count.id]),
  );
  const bomByStatus = Object.fromEntries(
    bomStatusCounts.map((r) => [r.status, r._count.id]),
  );

  const inspected = Number(qiTotals._sum.inspectedQuantity || 0);
  const accepted = Number(qiTotals._sum.acceptedQuantity || 0);
  const passRate =
    inspected > 0 ? ((accepted / inspected) * 100).toFixed(1) : "0.0";

  return {
    workOrders: {
      byStatus: woByStatus,
      total: woTotals._count.id,
      planned: Number(woTotals._sum.plannedQuantity || 0),
      produced: Number(woTotals._sum.goodQuantity || 0),
      rejected: Number(woTotals._sum.rejectedQuantity || 0),
      completedThisMonth,
      delayed: delayedOrders,
      active: activeWorkOrders,
    },
    inventory: {
      available: Math.max(
        0,
        Number(inventoryTotals._sum.physicalQuantity || 0) -
          Number(inventoryTotals._sum.reservedQuantity || 0),
      ),
      reserved: Number(inventoryTotals._sum.reservedQuantity || 0),
    },
    quality: {
      byStatus: qiByStatus,
      inspected,
      accepted,
      rejected: Number(qiTotals._sum.rejectedQuantity || 0),
      passRate: Number(passRate),
      pendingInspections,
    },
    bom: {
      byStatus: bomByStatus,
    },
  };
};

// ─────────────────────────────────────────────
// 2. GET Work Order Timeline (for Gantt)
// ─────────────────────────────────────────────
export const getWorkOrderTimeline = async (filters = {}) => {
  const { from, to } = filters;
  const where = {
    plannedStart: { not: null },
  };
  if (from) where.plannedStart = { ...where.plannedStart, gte: new Date(from) };
  if (to) where.plannedEnd = { lte: new Date(to) };

  return await prisma.workOrder.findMany({
    where,
    select: {
      id: true,
      workOrderNo: true,
      status: true,
      priority: true,
      plannedQuantity: true,
      goodQuantity: true,
      plannedStart: true,
      plannedEnd: true,
      actualStart: true,
      actualEnd: true,
      salesOrder: {
        select: {
          orderNumber: true,
          customer: { select: { name: true } },
          items: {
            take: 1,
            include: { product: { select: { name: true, sku: true } } },
          },
        },
      },
    },
    orderBy: { plannedStart: "asc" },
  });
};
