import { jsx as _jsx } from "react/jsx-runtime";
// src/components/Layout/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
/** Variante wrapper: se usa como <ProtectedRoute><Algo/></ProtectedRoute> */
export default function ProtectedRoute({ children }) {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();
    if (loading)
        return _jsx("div", { style: { padding: 24 }, children: "Cargando\u2026" });
    if (!isAuthenticated || !user) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: location } });
    }
    return children;
}
/** Variante Outlet: se usa en árboles de rutas anidadas con <Outlet/> */
export function ProtectedOutlet() {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();
    if (loading)
        return _jsx("div", { style: { padding: 24 }, children: "Cargando\u2026" });
    if (!isAuthenticated || !user) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: location } });
    }
    return _jsx(Outlet, {});
}
