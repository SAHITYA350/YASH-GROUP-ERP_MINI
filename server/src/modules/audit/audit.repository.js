export const createAuditRepository = (prisma) => ({
  create: async (tx, { userId, action, entityType, entityId, after }) => {
    const client = tx || prisma;
    return client.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId: String(entityId),
        after,
      },
    });
  },

  findRecent: async (limit = 10) => {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });
  },
});
