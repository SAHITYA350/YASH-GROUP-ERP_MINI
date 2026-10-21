export const PERMISSION_MODULES = [
  {
    module: "Dashboard",
    key: "dashboard",
    permissions: [
      { key: "dashboard:read", label: "View Dashboard & Metrics", description: "View sales analytics and summary KPIs" },
    ],
  },
  {
    module: "Customers",
    key: "customer",
    permissions: [
      { key: "customer:read", label: "View Customers", description: "Browse and view customer profiles" },
      { key: "customer:write", label: "Create & Edit Customers", description: "Add new customers and update details" },
    ],
  },
  {
    module: "Enquiries & Leads",
    key: "enquiry",
    permissions: [
      { key: "enquiry:read", label: "View Enquiries", description: "Browse leads and view enquiry details" },
      { key: "enquiry:write", label: "Create & Edit Enquiries", description: "Add leads and update stage or values" },
      { key: "activity:write", label: "Log Activities & Calls", description: "Record communications and notes" },
    ],
  },
  {
    module: "Quotations",
    key: "quote",
    permissions: [
      { key: "quote:read", label: "View Quotations", description: "Browse and view quotations" },
      { key: "quote:write", label: "Create & Edit Quotations", description: "Draft and revise quotations" },
      { key: "quote:approve", label: "Approve Quotations", description: "Manager approval for high-value quotes" },
    ],
  },
  {
    module: "Sales Orders",
    key: "order",
    permissions: [
      { key: "order:read", label: "View Orders", description: "Browse and view sales orders" },
      { key: "order:write", label: "Create & Manage Orders", description: "Convert quotes into orders and update status" },
    ],
  },
  {
    module: "Invoices & Payments",
    key: "invoice",
    permissions: [
      { key: "invoice:read", label: "View Invoices", description: "View tax invoices and balances" },
      { key: "invoice:write", label: "Create Invoices & Record Payments", description: "Generate invoices and record payments" },
    ],
  },
  {
    module: "Product Catalogue",
    key: "product",
    permissions: [
      { key: "product:read", label: "View Catalogue", description: "Browse products, SKUs and prices" },
      { key: "product:write", label: "Manage Products", description: "Create and edit products and pricing" },
    ],
  },
  {
    module: "User & Access Management",
    key: "user",
    permissions: [
      { key: "user:read", label: "View Users", description: "View staff list and assigned roles" },
      { key: "user:manage", label: "Manage Roles & Accessibility", description: "Modify user roles and tick/untick accessibility" },
    ],
  },
  {
    module: "Audit & Compliance",
    key: "audit",
    permissions: [
      { key: "audit:read", label: "View Audit Logs", description: "Inspect system audit trails" },
    ],
  },
  {
    module: "Super Administrator",
    key: "admin",
    permissions: [
      { key: "*", label: "Full System Access (Wildcard)", description: "Unrestricted access to all ERP modules and actions" },
    ],
  },
];

export const ALL_PERMISSIONS = PERMISSION_MODULES.flatMap((m) =>
  m.permissions.map((p) => p.key)
);

export const ROLE_PERMISSIONS = {
  ADMIN: ["*"],
  SALES_MANAGER: [
    "dashboard:read",
    "customer:read",
    "customer:write",
    "enquiry:read",
    "enquiry:write",
    "activity:write",
    "quote:read",
    "quote:write",
    "quote:approve",
    "order:read",
    "order:write",
    "invoice:read",
    "invoice:write",
    "product:read",
    "product:write",
    "user:read",
    "audit:read",
  ],
  SALES_CONSULTANT: [
    "dashboard:read",
    "customer:read",
    "customer:write",
    "enquiry:read",
    "enquiry:write",
    "activity:write",
    "quote:read",
    "quote:write",
    "order:read",
    "invoice:read",
    "product:read",
  ],
  BACK_OFFICER: [
    "dashboard:read",
    "customer:read",
    "enquiry:read",
    "quote:read",
    "order:read",
    "invoice:read",
    "product:read",
  ],
  FINANCE_MANAGER: [
    "dashboard:read",
    "customer:read",
    "quote:read",
    "order:read",
    "invoice:read",
    "invoice:write",
    "product:read",
    "audit:read",
  ],
  BANK_OFFICE_EXECUTIVE: [
    "dashboard:read",
    "customer:read",
    "order:read",
    "invoice:read",
    "product:read",
  ],
  DISPATCH_OFFICER: [
    "dashboard:read",
    "order:read",
    "invoice:read",
    "product:read",
  ],
  FACTORY_INWARD_OFFICER: [
    "dashboard:read",
    "product:read",
  ],
  PROCUREMENT_OFFICER: [
    "dashboard:read",
    "product:read",
    "product:write",
  ],
  ENGINEER: [
    "dashboard:read",
    "product:read",
    "quote:read",
  ],
  PRODUCTION_MANAGER: [
    "dashboard:read",
    "order:read",
    "product:read",
  ],
  QUALITY_INSPECTOR: [
    "dashboard:read",
    "order:read",
    "product:read",
  ],
  PROJECT_MANAGER: [
    "dashboard:read",
    "customer:read",
    "order:read",
    "product:read",
  ],
  SERVICE_EXECUTIVE: [
    "dashboard:read",
    "customer:read",
    "product:read",
  ],
  HR_MANAGER: [
    "dashboard:read",
    "user:read",
    "user:manage",
    "audit:read",
  ],
};

export const AVAILABLE_ROLES = [
  { value: "ADMIN", label: "Admin", department: "Administration" },
  { value: "SALES_MANAGER", label: "Sales Manager", department: "Sales" },
  { value: "SALES_CONSULTANT", label: "Sales Consultant", department: "Sales" },
  { value: "BACK_OFFICER", label: "Back Officer", department: "Operations" },
  { value: "FINANCE_MANAGER", label: "Finance Manager", department: "Finance" },
  { value: "BANK_OFFICE_EXECUTIVE", label: "Bank Office Executive", department: "Finance" },
  { value: "DISPATCH_OFFICER", label: "Dispatch Officer", department: "Logistics" },
  { value: "FACTORY_INWARD_OFFICER", label: "Factory Inward Officer", department: "Warehouse" },
  { value: "PROCUREMENT_OFFICER", label: "Procurement Officer", department: "Purchase" },
  { value: "ENGINEER", label: "Engineer", department: "Engineering" },
  { value: "PRODUCTION_MANAGER", label: "Production Manager", department: "Production" },
  { value: "QUALITY_INSPECTOR", label: "Quality Inspector", department: "Quality" },
  { value: "PROJECT_MANAGER", label: "Project Manager", department: "Projects" },
  { value: "SERVICE_EXECUTIVE", label: "Service Executive", department: "Support" },
  { value: "HR_MANAGER", label: "HR Manager", department: "Human Resources" },
];

/**
 * Returns effective permissions for a user:
 * - If user is ADMIN or has '*', returns ['*']
 * - If user has custom permissions array explicitly set, uses user permissions.
 *   (or defaults to role permissions if user permissions is empty or null)
 */
export const permissionsFor = (user) => {
  if (!user) return [];
  if (user.role === "ADMIN") return ["*"];

  const roleBase = ROLE_PERMISSIONS[user.role] || [];
  const custom = Array.isArray(user.permissions) ? user.permissions : [];

  if (custom.includes("*")) return ["*"];

  if (custom.length > 0) {
    // If the admin has customized this user's permissions, use them (deduplicated)
    return Array.from(new Set(custom));
  }

  return roleBase;
};

export const hasPermission = (user, permission) => {
  if (!user) return false;
  if (user.role === "ADMIN") return true;

  const perms = permissionsFor(user);
  return perms.includes("*") || perms.includes(permission);
};
