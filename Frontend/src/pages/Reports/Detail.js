import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Heading, Text, Flex } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
export default function ReportsDetail() {
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsxs(Box, { flex: "1", p: { base: 4, md: 6 }, children: [_jsx(Heading, { mb: 2, color: "blue.700", children: "Detalle del Reporte" }), _jsx(Text, { color: "blue.600", children: "TODO: Vista detallada de un reporte espec\u00EDfico." })] })] })] }));
}
