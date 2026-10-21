import { useState } from "react";
import {
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  X,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const allNavItems = [
  ["/", LayoutDashboard, "Dashboard", "dashboard:read"],
  ["/enquiries", ClipboardList, "Enquiries", "enquiry:read"],
  ["/customers", Building2, "Customers", "customer:read"],
  ["/quotations", FileText, "Quotations", "quote:read"],
  ["/orders", ShoppingCart, "Sales orders", "order:read"],
  ["/invoices", Receipt, "Invoices", "invoice:read"],
  ["/products", Package, "Product catalogue", "product:read"],
  // Access management is visible only to admins
  ["/access-management", ShieldCheck, "Access management", "__admin__"],
];

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, hasPermission, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  /**
   * Determines nav-item visibility.
   * "__admin__" is a sentinel meaning "ADMIN role only".
   * All other permission keys are evaluated against effective permissions
   * returned by the server (user.permissions already reflects effectivePermissions).
   */
  const isNavVisible = (perm) => {
    if (!perm) return true;
    if (perm === "__admin__") return isAdmin;
    return hasPermission(perm);
  };

  const visibleNavItems = allNavItems.filter(([, , , perm]) => isNavVisible(perm));

  return (
    <div className="shell">
      <aside className={open ? "open" : ""}>
        <button className="close" onClick={() => setOpen(false)}>
          <X />
        </button>
        <p className="brand">YASH EARTHING</p>
        <h1>Sales ERP</h1>
        <nav>
          {visibleNavItems.map(([to, Icon, text]) => (
            <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)}>
              <Icon size={18} />
              {text}
            </NavLink>
          ))}
        </nav>
        <button className="logout" onClick={handleLogout}>
          <LogOut size={17} />
          Sign out
        </button>
      </aside>
      {open && <button className="backdrop" onClick={() => setOpen(false)} />}
      <section className="workspace">
        <header>
          <button className="menu" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <span>Sales, CRM &amp; Order · Module 1</span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "11px",
                background: isAdmin ? "#ecfdf5" : "#f1f5f9",
                color: isAdmin ? "#047857" : "#475569",
                padding: "3px 8px",
                borderRadius: "999px",
                fontWeight: "600",
              }}
            >
              {user?.role}
            </span>
            <b>{user?.name}</b>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </section>
    </div>
  );
}
