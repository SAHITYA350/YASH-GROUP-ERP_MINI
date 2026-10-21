export const createAuthRepository = (prisma) => ({
  findUserByEmail: async (email) => {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  },

  findUserById: async (id) => {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  createSession: async ({ id, userId, expiresAt, userAgent, ipAddress }) => {
    return prisma.session.create({
      data: {
        id,
        userId,
        expiresAt,
        userAgent: userAgent?.slice(0, 500),
        ipAddress,
      },
    });
  },

  findValidSession: async (sessionId) => {
    return prisma.session.findFirst({
      where: {
        id: sessionId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  },

  revokeSession: async (sessionId) => {
    return prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  },
});
