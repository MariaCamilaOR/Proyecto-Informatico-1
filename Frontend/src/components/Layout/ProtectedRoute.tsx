// src/components/Layout/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/** Variante wrapper: se usa como <ProtectedRoute><Algo/></ProtectedRoute> */
export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>;
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

/** Variante Outlet: se usa en árboles de rutas anidadas con <Outlet/> */
export function ProtectedOutlet() {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>;
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
         