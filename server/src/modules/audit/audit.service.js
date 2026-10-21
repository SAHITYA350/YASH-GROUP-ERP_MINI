export const createAuditService = (auditRepo) => ({
  log: async (tx, userId, action, entityType, entityId, after) => {
    return auditRepo.create(tx, {
      userId,
      action,
      entityType,
      entityId,
      after,
    });
  },

  getRecentLogs: async (limit = 10) => {
    return auditRepo.findRecent(limit);
  },
});
