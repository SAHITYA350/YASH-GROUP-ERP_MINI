import { permissionsFor } from "../../constants/permissions.js";
import { loginSchema } from "../../schemas/index.js";
import { parse } from "../../utils/http.js";

const writeCookie = (res, name, value, production, options = {}) =>
  res.cookie(name, value, {
    path: "/",
    sameSite: "lax",
    secure: production,
    httpOnly: name === "yash_session",
    ...options,
  });

export const presentUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  isActive: user.isActive,
  permissions: permissionsFor(user),
  customPermissions: Array.isArray(user.permissions) ? user.permissions : [],
});

export const createAuthController = (authService, { production }) => ({
  login: async (req, res, next) => {
    try {
      const input = parse(loginSchema, req.body);
      const session = await authService.login({
        ...input,
        userAgent: req.get("user-agent"),
        ipAddress: req.ip,
      });

      writeCookie(res, "yash_session", session.id, production, {
        maxAge: 28800000,
      });
      writeCookie(res, "yash_csrf", session.csrfToken, production, {
        httpOnly: false,
        maxAge: 28800000,
      });

      res.json({
        data: {
          user: presentUser(session.user),
          csrfToken: session.csrfToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  me: (req, res) =>
    res.json({
      data: {
        user: presentUser(req.user),
        csrfToken: req.cookies.yash_csrf,
      },
    }),

  logout: async (req, res, next) => {
    try {
      if (req.session?.id) {
        await authService.logout(req.session.id);
      }
      res
        .clearCookie("yash_session")
        .clearCookie("yash_csrf")
        .status(204)
        .end();
    } catch (error) {
      next(error);
    }
  },
});
