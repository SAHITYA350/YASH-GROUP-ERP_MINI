import { Navigate } from "react-router-dom";
import useApi from "../hooks/useApi.js";
import AppShell from "./AppShell.jsx";

export default function ProtectedRoute() {
  const query = useApi("/auth/me");
  if (query.loading) {
    return <p className="loading">Loading secure workspace…</p>;
  }
  return query.error ? (
    <Navigate to="/login" replace />
  ) : (
    <AppShell user={query.data.data.user} />
  );
}