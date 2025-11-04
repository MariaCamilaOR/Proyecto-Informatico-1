import { jsx as _jsx } from "react/jsx-runtime";
// src/components/Layout/RoleGuard.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { routeByRole, normalizeRole } from "../../lib/roles";
export default function RoleGuard({ allowed, children, }) {
    const { user, loading, isAuthenticated } = useAuth();
    if (loading)
        return null;
    if (!isAuthenticated || !user)
        return _jsx(Navigate, { to: "/login", replace: true });
    const r = normalizeRole(user.role);
    if (r && allowed.includes(r))
        return children;
    return _jsx(Navigate, { to: routeByRole(r), replace: true });
}
