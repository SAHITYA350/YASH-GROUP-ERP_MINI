import { hasPermission } from "../constants/permissions.js";
import { fail } from "../utils/http.js";

export const requirePermission = (permission) => (req, _res, next) =>
  hasPermission(req.user, permission)
    ? next()
    : next(fail(403, "You do not have permission for this action", "FORBIDDEN"));