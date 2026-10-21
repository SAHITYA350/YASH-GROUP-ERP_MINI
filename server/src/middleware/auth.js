import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'yash-group-erp-secure-jwt-key-2026';

// Strict authentication middleware
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const devRole = req.headers['x-user-role'];

  // 1. Bearer Token Verification
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please re-authenticate.',
      });
    }
  }

  // 2. Test environment role bypass (Strictly disabled unless ALLOW_DEV_ROLE_HEADER is explicitly enabled)
  if (process.env.ALLOW_DEV_ROLE_HEADER === 'true' && process.env.NODE_ENV === 'test' && devRole) {
    req.user = {
      id: 1,
      email: 'admin@yashgroup.com',
      name: 'Test Management User',
      role: devRole,
      department: 'Management',
    };
    return next();
  }

  // 3. In dev mode without token, gracefully identify as admin
  if (process.env.NODE_ENV !== 'production') {
    req.user = {
      id: 1,
      email: 'admin@yashgroup.com',
      name: 'Management Admin',
      role: 'ADMIN',
      department: 'Management',
    };
    return next();
  }

  // 4. Reject unauthenticated requests strictly in production
  return res.status(401).json({
    success: false,
    message: 'Access denied: Authentication required. Provide a valid Bearer token in the Authorization header.',
  });
}

// Strict role authorization guard
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRole = req.user.role;
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole) && userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: ${userRole}`,
      });
    }
    next();
  };
}

export default {
  authenticate,
  authorizeRoles,
  JWT_SECRET,
};
