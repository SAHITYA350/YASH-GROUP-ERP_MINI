// ============================================================================
// RBAC - single source of truth for role permissions.
//
// Add a role, or change what a role can do, HERE - you never need to touch
// the routes. Role names come from the UserRole enum in prisma/schema.prisma.
//
//   modules: which modules the role can open ("*" = everything)
//   actions: which actions the role can run inside those modules
//            ("*" = everything)
//
// NOTE: hiding a button in React is not security. Every API route must call
//       authenticate + authorize (see utils/auth.js). This map is what the
//       server actually enforces.
// ============================================================================

export const ROLE_PERMISSIONS = {
  // Full control over every module (manage users, roles, all data).
  ADMIN: {
    modules: ["*"],
    actions: ["*"],
  },
  // Finance & Commercial - view reports, approve bills, issue invoices.
  FINANCE_MANAGER: {
    modules: ["finance", "users"],
    actions: ["read", "create", "update", "approve"],
  },
  // Accountant - creates invoices, records receipts, enters bills.
  BANK_OFFICE_EXECUTIVE: {
    modules: ["finance"],
    actions: ["read", "create"],
  },
  // Sales - CRM, leads, service tickets. Deliberately NO finance access.
  SALES_MANAGER: {
    modules: ["crm", "sales", "leads", "services", "users"],
    actions: ["read", "create", "update"],
  },
  // Read-only user - views dashboards and records, cannot change anything.
  BACK_OFFICER: {
    modules: ["finance", "leads", "services", "users"],
    actions: ["read"],
  },
  // Any other UserRole enum value not listed above gets NO module access
  // until you add it here.
};

/**
 * Returns true when `role` may run `action` inside `moduleName`.
 * @param {string} role       UserRole enum value, e.g. "FINANCE_MANAGER"
 * @param {string} moduleName e.g. "finance", "crm", "sales"
 * @param {string} action     e.g. "read", "create", "update", "approve"
 */
export function canAccess(role, moduleName, action) {
  const perm = ROLE_PERMISSIONS[role];
  if (!perm) return false;

  const moduleOk =
    perm.modules.includes("*") || perm.modules.includes(moduleName);
  if (!moduleOk) return false;

  return perm.actions.includes("*") || perm.actions.includes(action);
}

export default { ROLE_PERMISSIONS, canAccess };
