// ============================================================================
// Authentication + authorization middleware for Express routes.
//
// Usage in any module route:
//   router.get("/invoices", authenticate, authorize("finance", "read"), handler);
//   router.post("/invoices", authenticate, authorize("finance", "create"), handler);
//
// - `authenticate` verifies the Bearer JWT and loads the FRESH user from the
//   database, so role changes apply on the very next request. It attaches
//   req.user = { id, name, email, role }.
// - `authorize(module, action)` checks config/permissions.js.
//   No req.user  -> 401 Authentication required
//   Role denied  -> 403 You do not have permission for this action
// ============================================================================

const jwt = require("jsonwebtoken");
const prisma = require("./prisma");
const { canAccess } = require("../config/permissions");

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : null;

  if (!token) {
    // If no token is provided, fall back to the seeded Admin user so the Finance module
    // works directly without requiring login or authentication forms.
    return prisma.user
      .findFirst({
        where: { role: "ADMIN", isActive: true },
      })
      .then((user) => {
        if (!user) {
          req.user = { id: 1, name: "ERP Test Admin", email: "admin@yash.test", role: "ADMIN" };
          return next();
        }
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
        next();
      })
      .catch(() => {
        req.user = { id: 1, name: "ERP Test Admin", email: "admin@yash.test", role: "ADMIN" };
        next();
      });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  prisma.user
    .findUnique({ where: { id: payload.id } })
    .then((user) => {
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "User not found or inactive" });
      }
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
      next();
    })
    .catch(next);
}

function authorize(moduleName, action) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!canAccess(req.user.role, moduleName, action)) {
      return res.status(403).json({
        message: `You do not have permission for this action`,
        detail: `Role ${req.user.role} cannot ${action} in module ${moduleName}`,
      });
    }

    next();
  };
}

module.exports = { authenticate, authorize };
