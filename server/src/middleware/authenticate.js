import { fail } from "../utils/http.js";

export const createAuthenticate = (prisma) => async (req, _res, next) => {
  try {
    const sessionId = req.cookies.yash_session;
    if (!sessionId) {
      throw fail(401, "Authentication required", "UNAUTHENTICATED");
    }
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
    if (!session?.user.isActive) {
      throw fail(401, "Authentication required", "UNAUTHENTICATED");
    }
    req.user = session.user;
    req.session = session;
    next();
  } catch (error) {
    next(error);
  }
};