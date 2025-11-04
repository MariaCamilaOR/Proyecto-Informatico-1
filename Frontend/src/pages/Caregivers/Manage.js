import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Heading, Text, Flex, VStack, Alert, AlertIcon } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { CaregiverManager } from "../../components/CaregiverLink/CaregiverManager";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
export default function CaregiversManage() {
    const { user } = useAuth();
    const canManageCaregivers = user && hasPermission(user.role, "manage_caregivers");
    if (!canManageCaregivers) {
        return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(Alert, { status: "warning", children: [_jsx(AlertIcon, {}), "No tienes permisos para gestionar cuidadores con tu rol actual."] }) })] })] }));
    }
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Heading, { mb: 2, children: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66 Gesti\u00F3n de Cuidadores" }), _jsx(Text, { color: "blue.600", children: "Administra los cuidadores vinculados a tu cuenta de paciente" })] }), _jsx(CaregiverManager, { patientId: user?.uid || "demo-patient", canManage: true }), _jsx(Box, { p: 4, bg: "blue.50", borderRadius: "md", children: _jsxs(VStack, { spacing: 3, align: "start", children: [_jsx(Text, { fontWeight: "bold", children: "\uD83D\uDCA1 Informaci\u00F3n sobre cuidadores:" }), _jsxs(VStack, { align: "start", spacing: 1, fontSize: "sm", color: "blue.600", children: [_jsx(Text, { children: "\u2022 Los cuidadores pueden ayudarte a subir fotos y ver tu progreso" }), _jsx(Text, { children: "\u2022 Puedes configurar qu\u00E9 permisos tiene cada cuidador" }), _jsx(Text, { children: "\u2022 Las invitaciones expiran despu\u00E9s de 7 d\u00EDas" }), _jsx(Text, { children: "\u2022 Puedes revocar el acceso de un cuidador en cualquier momento" })] })] }) })] }) })] })] }));
}
