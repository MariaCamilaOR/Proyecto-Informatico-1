import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Heading, Text, Flex, VStack, Alert, AlertIcon } from "@chakra-ui/react";
import { Navbar } from "./../components/Layout/Navbar";
import { Sidebar } from "./../components/Layout/Sidebar";
import { OnboardingWizard } from "./../components/Onboarding/OnboardingWizard";
import { useAuth } from "./../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
export default function Onboarding() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOnboardingActive, setIsOnboardingActive] = useState(true);
    const handleOnboardingComplete = (data) => {
        console.log("Onboarding completado:", data);
        setIsOnboardingActive(false);
        navigate("/", { replace: true });
    };
    const handleOnboardingSkip = () => {
        console.log("Onboarding omitido");
        setIsOnboardingActive(false);
        navigate("/", { replace: true });
    };
    if (!isOnboardingActive) {
        return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(Alert, { status: "success", children: [_jsx(AlertIcon, {}), _jsxs(VStack, { align: "start", spacing: 1, children: [_jsx(Text, { fontWeight: "bold", children: "\u00A1Configuraci\u00F3n completada!" }), _jsx(Text, { fontSize: "sm", children: "Tu perfil ha sido configurado. Ahora puedes comenzar a usar DoYouRemember." })] })] }), _jsxs(VStack, { spacing: 4, align: "start", children: [_jsx(Heading, { size: "md", children: "Pr\u00F3ximos pasos:" }), _jsxs(VStack, { align: "start", spacing: 2, fontSize: "sm", color: "blue.600", children: [_jsx(Text, { children: "\u2022 Sube m\u00E1s fotos familiares a tu galer\u00EDa" }), _jsx(Text, { children: "\u2022 Comienza a describir tus fotos usando el asistente" }), _jsx(Text, { children: "\u2022 Configura tus recordatorios en la secci\u00F3n de alertas" }), _jsx(Text, { children: "\u2022 Revisa tus reportes de progreso regularmente" })] })] })] }) })] })] }));
    }
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsx(OnboardingWizard, { onComplete: handleOnboardingComplete, onSkip: handleOnboardingSkip }) })] })] }));
}
