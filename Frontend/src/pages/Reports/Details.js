import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Heading, Text, Flex, VStack, HStack, Card, CardBody, Alert, AlertIcon, Badge, } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { ReportFilters } from "../../components/Filters/ReportFilters";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { useState } from "react";
export default function ReportsDetails() {
    const { user } = useAuth();
    const [activeFilters, setActiveFilters] = useState(null);
    const canViewReports = !!user &&
        (hasPermission(user.role, "view_own_reports") ||
            hasPermission(user.role, "view_patient_reports") ||
            hasPermission(user.role, "view_detailed_analytics"));
    const handleFiltersChange = (filters) => {
        setActiveFilters(filters);
        // eslint-disable-next-line no-console
        console.log("Filtros aplicados:", filters);
    };
    const handleClearFilters = () => {
        setActiveFilters(null);
        // eslint-disable-next-line no-console
        console.log("Filtros limpiados");
    };
    if (!canViewReports) {
        return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(Alert, { status: "warning", children: [_jsx(AlertIcon, {}), "No tienes permisos para ver reportes con tu rol actual."] }) })] })] }));
    }
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(Flex, { justify: "space-between", align: "center", children: [_jsxs(Box, { children: [_jsx(Heading, { mb: 2, color: "blue.700", children: "\uD83D\uDCCA Detalles de Reportes" }), _jsx(Text, { color: "blue.600", children: "Vista detallada con filtros avanzados" })] }), _jsx(ReportFilters, { onFiltersChange: handleFiltersChange, onClearFilters: handleClearFilters, availableTags: ["familia", "amigos", "vacaciones", "cumpleaños", "trabajo", "hogar"] })] }), activeFilters && (_jsx(Card, { children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 3, align: "start", children: [_jsx(Text, { fontWeight: "bold", children: "\uD83D\uDD0D Filtros Activos:" }), _jsxs(VStack, { spacing: 2, align: "start", fontSize: "sm", children: [activeFilters.dateRange?.start && (_jsxs(HStack, { children: [_jsx(Badge, { colorScheme: "blue", children: "Fecha desde:" }), _jsx(Text, { children: new Date(activeFilters.dateRange.start).toLocaleDateString("es-ES") })] })), activeFilters.dateRange?.end && (_jsxs(HStack, { children: [_jsx(Badge, { colorScheme: "blue", children: "Fecha hasta:" }), _jsx(Text, { children: new Date(activeFilters.dateRange.end).toLocaleDateString("es-ES") })] })), (activeFilters.metrics?.recall?.[0] > 0 ||
                                                            activeFilters.metrics?.recall?.[1] < 100) && (_jsxs(HStack, { children: [_jsx(Badge, { colorScheme: "green", children: "Recall:" }), _jsxs(Text, { children: [activeFilters.metrics.recall[0], "% - ", activeFilters.metrics.recall[1], "%"] })] })), (activeFilters.metrics?.coherence?.[0] > 0 ||
                                                            activeFilters.metrics?.coherence?.[1] < 100) && (_jsxs(HStack, { children: [_jsx(Badge, { colorScheme: "purple", children: "Coherencia:" }), _jsxs(Text, { children: [activeFilters.metrics.coherence[0], "% - ", activeFilters.metrics.coherence[1], "%"] })] })), activeFilters.tags?.length > 0 && (_jsxs(HStack, { align: "start", children: [_jsx(Badge, { colorScheme: "orange", children: "Etiquetas:" }), _jsx(HStack, { spacing: 1, flexWrap: "wrap", children: activeFilters.tags.map((tag) => (_jsx(Badge, { size: "sm", children: tag }, tag))) })] })), typeof activeFilters.sessions?.min === "number" &&
                                                            typeof activeFilters.sessions?.max === "number" &&
                                                            (activeFilters.sessions.min > 0 || activeFilters.sessions.max < 50) && (_jsxs(HStack, { children: [_jsx(Badge, { colorScheme: "teal", children: "Sesiones:" }), _jsxs(Text, { children: [activeFilters.sessions.min, " - ", activeFilters.sessions.max] })] }))] })] }) }) })), _jsx(Card, { children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, children: [_jsx(Text, { fontWeight: "bold", fontSize: "lg", children: "\uD83D\uDCC8 Reportes Filtrados" }), activeFilters ? (_jsxs(VStack, { spacing: 2, w: "full", children: [_jsxs(HStack, { justify: "space-between", w: "full", p: 3, bg: "blue.50", borderRadius: "md", children: [_jsx(Text, { fontWeight: "bold", children: "Sesi\u00F3n 1 - 15/01/2024" }), _jsxs(HStack, { spacing: 2, children: [_jsx(Badge, { colorScheme: "green", children: "Recall: 85%" }), _jsx(Badge, { colorScheme: "purple", children: "Coherencia: 90%" })] })] }), _jsxs(HStack, { justify: "space-between", w: "full", p: 3, bg: "blue.50", borderRadius: "md", children: [_jsx(Text, { fontWeight: "bold", children: "Sesi\u00F3n 2 - 18/01/2024" }), _jsxs(HStack, { spacing: 2, children: [_jsx(Badge, { colorScheme: "green", children: "Recall: 78%" }), _jsx(Badge, { colorScheme: "purple", children: "Coherencia: 82%" })] })] }), _jsxs(HStack, { justify: "space-between", w: "full", p: 3, bg: "blue.50", borderRadius: "md", children: [_jsx(Text, { fontWeight: "bold", children: "Sesi\u00F3n 3 - 22/01/2024" }), _jsxs(HStack, { spacing: 2, children: [_jsx(Badge, { colorScheme: "green", children: "Recall: 92%" }), _jsx(Badge, { colorScheme: "purple", children: "Coherencia: 88%" })] })] })] })) : (_jsxs(VStack, { spacing: 3, children: [_jsx(Text, { color: "blue.600", children: "Aplica filtros para ver reportes espec\u00EDficos" }), _jsxs(Alert, { status: "info", children: [_jsx(AlertIcon, {}), _jsx(Text, { fontSize: "sm", children: "Usa los filtros para encontrar reportes por fecha, m\u00E9tricas, etiquetas o n\u00FAmero de sesiones." })] })] }))] }) }) })] }) })] })] }));
}
