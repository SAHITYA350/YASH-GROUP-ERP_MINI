import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { fail } from "../../utils/http.js";

export const createAuthService = (authRepo) => ({
  login: async ({ email, password, userAgent, ipAddress }) => {
    const user = await authRepo.findUserByEmail(email);
    if (
      !user ||
      !user.isActive ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      throw fail(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    const id = crypto.randomUUID();
    const csrfToken = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 28800000); // 8 hours

    await authRepo.createSession({
      id,
      userId: user.id,
      expiresAt,
      userAgent,
      ipAddress,
    });

    return { id, csrfToken, user };
  },

  logout: async (sessionId) => {
    return authRepo.revokeSession(sessionId);
  },

  validateSession: async (sessionId) => {
    const session = await authRepo.findValidSession(sessionId);
    if (!session?.user?.isActive) {
      return null;
    }
    return session;
  },
});
