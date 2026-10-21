import { hasPermission } from "../constants/permissions.js";
import { fail } from "../utils/http.js";

export const requirePermission = (permission) => (req, _res, next) =>
  hasPermission(req.user, permission)
    ? next()
    : next(fail(403, "You do not have permission for this action", "FORBIDDEN"));

/**
 * Middleware that restricts a route to ADMIN role only.
 * Even users with user:manage permission (e.g. HR_MANAGER) are blocked.
 * Must be placed AFTER the authenticate middleware.
 */
export const requireAdmin = (req, _res, next) =>
  req.user?.role === "ADMIN"
    ? next()
    : next(
        fail(
          403,
          "Only administrators can perform this action",
          "ADMIN_REQUIRED"
        )
      );
