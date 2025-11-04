import { jsx as _jsx } from "react/jsx-runtime";
// src/components/Layout/Sidebar.tsx
import { Box, VStack, Link as CLink, Text } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { normalizeRole } from "../../lib/roles";
export function Sidebar() {
    const { pathname } = useLocation();
    const { user } = useAuth();
    const role = normalizeRole(user?.role);
    // Base y menús por rol
    const base = [{ path: "/", label: "Dashboard" }];
    const byRole = {
        PATIENT: [
            ...base,
            { path: "/photos", label: "Fotos" },
            { path: "/patient/gallery", label: "Galería" },
            { path: "/describe/wizard", label: "Describir" },
            { path: "/alerts", label: "Alertas" },
            { path: "/reminders", label: "Recordatorios" },
        ],
        CAREGIVER: [
            ...base,
            { path: "/photos", label: "Fotos" },
            { path: "/cuidador/photos/upload", label: "Subir Fotos" },
            { path: "/caregivers/patients", label: "Mis Pacientes" },
            { path: "/caregivers/manage", label: "Gestionar Cuidadores" },
            { path: "/alerts", label: "Alertas" },
            { path: "/reminders", label: "Recordatorios" },
        ],
        DOCTOR: [
            ...base,
            { path: "/reports", label: "Reportes" },
            { path: "/alerts", label: "Alertas" },
        ],
    };
    // Si no hay rol aún (cargando), muestra base; si hay rol usa su menú
    const menuItems = role ? byRole[role] : base;
    const isActive = (path) => pathname === path || pathname.startsWith(path + "/");
    return (_jsx(Box, { className: "dyr-sidebar", children: _jsx(VStack, { spacing: 6, align: "stretch", children: menuItems.map((item) => {
                const active = isActive(item.path);
                return (_jsx(CLink, { as: RouterLink, to: item.path, className: active ? "active" : "", _hover: { textDecoration: "none" }, children: _jsx(Text, { fontWeight: active ? "bold" : "normal", children: item.label }) }, item.path));
            }) }) }));
}
