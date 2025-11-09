// src/components/Layout/RoleGuard.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { routeByRole, normalizeRole, type Role } from "../../lib/roles";
// layout handled by pages individually; do not wrap here

export default function RoleGuard({
  allowed,
  children,
}: {
  allowed: Role[];
  children: JSX.Element;
}) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const r = normalizeRole(user.role as any);
  if (r && allowed.includes(r)) return children;

  return <Navigate to={routeByRole(r)} replace />;
}
