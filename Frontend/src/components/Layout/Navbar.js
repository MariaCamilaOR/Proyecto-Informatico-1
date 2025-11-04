import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/Layout/Navbar.tsx
import { Box, Flex, Heading, Button, Spacer, HStack, Text, IconButton, useToast } from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutFirebase } from "../../store/thunks/authThunks";
export function Navbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleSignOut = async () => {
        try {
            await dispatch(logoutFirebase());
        }
        finally {
            // por si quedaba algo del modo demo
            localStorage.removeItem("demo-user");
            localStorage.removeItem("demo-role");
            navigate("/login", { replace: true });
        }
    };
    return (_jsx(Box, { bgGradient: "linear(to-br, blue.50, white)", color: "blue.700", p: 4, borderBottom: "2px solid", borderColor: "blue.200", boxShadow: "0 2px 8px rgba(25, 118, 210, 0.1)", children: _jsxs(Flex, { align: "center", children: [_jsx(Heading, { size: "md", color: "blue.700", children: "DoYouRemember" }), _jsx(Spacer, {}), _jsx(InviteCodeDisplay, {}), _jsx(Button, { variant: "outline", colorScheme: "blue", borderColor: "blue.500", color: "blue.600", onClick: handleSignOut, _hover: {
                        bg: "blue.50",
                        borderColor: "blue.600",
                        color: "blue.700"
                    }, children: "Cerrar sesi\u00F3n" })] }) }));
}
function InviteCodeDisplay() {
    const { user } = useAuth();
    const toast = useToast();
    if (!user)
        return null;
    if (!user.role || user.role.toLowerCase() !== "patient")
        return null;
    const code = user.inviteCode || user.uid;
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code ?? "");
            toast({ title: "Código copiado", status: "success", duration: 2000, isClosable: true });
        }
        catch (e) {
            toast({ title: "No se pudo copiar", status: "error", duration: 2000, isClosable: true });
        }
    };
    return (_jsxs(HStack, { spacing: 3, mr: 4, children: [_jsx(Text, { fontSize: "sm", color: "blue.600", children: "Invitaci\u00F3n:" }), _jsx(Box, { as: "code", px: 3, py: 1, bg: "blue.50", borderRadius: "md", fontFamily: "mono", color: "blue.700", fontSize: "sm", children: code }), _jsx(IconButton, { "aria-label": "Copiar c\u00F3digo", icon: _jsx(CopyIcon, {}), size: "sm", onClick: handleCopy })] }));
}
