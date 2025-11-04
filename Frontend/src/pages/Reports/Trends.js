import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Heading, Text, Flex, VStack, Alert, AlertIcon } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { SimpleReport } from "../../components/Reports/SimpleReport";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission, normalizeRole } from "../../lib/roles";
export default function ReportsTrends() {
    const { user } = useAuth();
    const role = normalizeRole(user?.role);
    // Paciente ve sus reportes; cuidador/médico ven reportes de pacientes
    const canViewReports = !!user &&
        (hasPermission(user.role, "view_own_reports") ||
            hasPermission(user.role, "view_patient_reports") ||
            hasPermission(user.role, "view_detailed_analytics"));
    if (!canViewReports) {
        return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(Alert, { status: "warning", children: [_jsx(AlertIcon, {}), "No tienes permisos para ver reportes con tu rol actual."] }) })] })] }));
    }
    const canExport = role === "DOCTOR";
    const canShare = role === "DOCTOR" || role === "CAREGIVER";
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Heading, { mb: 2, color: "blue.700", children: "\uD83D\uDCC8 Tendencias y Progreso" }), _jsx(Text, { color: "blue.600", children: "Monitorea el progreso y comp\u00E1ralo con la l\u00EDnea base." })] }), _jsx(SimpleReport, { canExport: canExport, canShare: canShare })] }) })] })] }));
}
