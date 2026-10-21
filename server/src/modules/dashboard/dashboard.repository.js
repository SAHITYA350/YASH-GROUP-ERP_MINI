export const createDashboardRepository = (prisma) => ({
  getMetrics: async () => {
    const [
      total,
      newCount,
      qualified,
      quotations,
      orders,
      due,
      byStage,
      bySource,
      recent,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { stage: "NEW" } }),
      prisma.lead.count({ where: { stage: "QUALIFIED" } }),
      prisma.quotation.count({
        where: { status: { in: ["DRAFT", "SENT_TO_CLIENT", "APPROVED"] } },
      }),
      prisma.salesOrder.count({
        where: {
          status: { in: ["CONFIRMED", "PROCESSING", "READY_FOR_DISPATCH"] },
        },
      }),
      prisma.lead.count({ where: { nextFollowUpAt: { lte: new Date() } } }),
      prisma.lead.groupBy({ by: ["stage"], _count: true }),
      prisma.lead.groupBy({ by: ["source"], _count: true }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }),
    ]);

    return {
      metrics: {
        total,
        new: newCount,
        qualified,
        openQuotations: quotations,
        confirmedOrders: orders,
        followUpsDue: due,
      },
      byStage,
      bySource,
      recent,
    };
  },
});
