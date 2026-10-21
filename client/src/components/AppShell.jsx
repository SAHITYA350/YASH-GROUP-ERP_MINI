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
import api from "../services/api.js";

const allNavItems = [
  ["/", LayoutDashboard, "Dashboard", "dashboard:read"],
  ["/enquiries", ClipboardList, "Enquiries", "enquiry:read"],
  ["/customers", Building2, "Customers", "customer:read"],
  ["/quotations", FileText, "Quotations", "quote:read"],
  ["/orders", ShoppingCart, "Sales orders", "order:read"],
  ["/invoices", Receipt, "Invoices", "invoice:read"],
  ["/products", Package, "Product catalogue", "product:read"],
  ["/access-management", ShieldCheck, "Access management", "user:read"],
];

export default function AppShell({ user }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    await api.post("/auth/logout");
    navigate("/login");
  };

  const hasAccess = (requiredPerm) => {
    if (!requiredPerm) return true;
    if (user.role === "ADMIN") return true;
    const perms = user.permissions || [];
    return perms.includes("*") || perms.includes(requiredPerm);
  };

  const visibleNavItems = allNavItems.filter(([_, __, ___, perm]) =>
    hasAccess(perm)
  );

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
        <button className="logout" onClick={logout}>
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
                background: user.role === "ADMIN" ? "#ecfdf5" : "#f1f5f9",
                color: user.role === "ADMIN" ? "#047857" : "#475569",
                padding: "3px 8px",
                borderRadius: "999px",
                fontWeight: "600",
              }}
            >
              {user.role}
            </span>
            <b>{user.name}</b>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </section>
    </div>
  );
}
