import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Blocks unauthenticated users — redirects them to /login.
 * Used to wrap all private routes in App.jsx.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="loading">Loading secure workspace…</p>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

/**
 * Blocks non-admin users from reaching sensitive admin-only pages.
 * Renders a 403 notice instead of redirecting, so the URL is preserved.
 * Place this *inside* a ProtectedRoute so auth is already confirmed.
 */
export function AdminRoute() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (!isAdmin) {
    return (
      <div
        style={{
          padding: "48px 32px",
          textAlign: "center",
          color: "#64748b",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#dc2626" }}>
          Access Denied
        </h2>
        <p style={{ marginTop: "8px" }}>
          Only administrators can access this page. Contact your system
          administrator if you believe this is a mistake.
        </p>
      </div>
    );
  }

  return <Outlet />;
}
