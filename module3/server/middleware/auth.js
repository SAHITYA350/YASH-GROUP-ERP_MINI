/**
 * Authentication and Role Authorization Middleware
 * Supports bearer token or default Engineering Persona session for Module 3
 */

export function authenticate(req, res, next) {
  // If authorization header is provided, inspect or attach user
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    req.user = {
      id: 1,
      name: "Er. Rajesh Sharma",
      email: "rajesh.sharma@yashearthing.com",
      role: "ENGINEER",
    };
  } else {
    // Default Engineering Persona context
    req.user = {
      id: 1,
      name: "Er. Rajesh Sharma",
      email: "rajesh.sharma@yashearthing.com",
      role: "ENGINEER",
      department: "Engineering",
    };
  }
  next();
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized access: login required" });
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role) && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: `Forbidden: role '${req.user.role}' lacks permission for this engineering resource`,
      });
    }
    next();
  };
}
