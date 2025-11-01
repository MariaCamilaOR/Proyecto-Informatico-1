import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute() {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // While auth is being determined, show a loading placeholder
  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>;

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}