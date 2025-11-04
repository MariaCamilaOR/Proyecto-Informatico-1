// src/components/Layout/RoleRedirect.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { routeByRole } from "../../lib/roles";
export default function RoleRedirect() {
    const { user, loading, isAuthenticated } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();
    useEffect(() => {
        if (loading)
            return;
        if (!isAuthenticated || !user?.role)
            return;
        const target = routeByRole(user.role);
        if (loc.pathname !== target) {
            nav(target, { replace: true }); // sin bucles
        }
    }, [loading, isAuthenticated, user?.role, loc.pathname, nav]);
    return null;
}
