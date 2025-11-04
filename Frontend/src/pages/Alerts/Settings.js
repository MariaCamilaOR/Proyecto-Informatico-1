import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Heading, Text, Flex } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
export default function AlertsSettings() {
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsxs(Box, { flex: "1", p: { base: 4, md: 6 }, children: [_jsx(Heading, { mb: 6, children: "Configuraci\u00F3n de Alertas" }), _jsx(Text, { children: "TODO: Configurar umbrales y notificaciones" })] })] })] }));
}
