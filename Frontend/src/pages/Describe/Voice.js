import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Heading, Text, Flex, VStack, Card, CardBody, Image, Alert, AlertIcon, } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { VoiceRecorder } from "../../components/VoiceRecording/VoiceRecorder";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { api } from "../../lib/api";
export default function DescribeVoice() {
    const { user } = useAuth();
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const canRecord = !!user && hasPermission(user.role, "describe_photos");
    const handleRecordingComplete = async (audioBlob, duration) => {
        try {
            // Subir audio (demo de endpoint)
            const form = new FormData();
            form.append("audio", audioBlob, "descripcion.webm");
            form.append("duration", String(duration));
            form.append("photoId", selectedPhoto || "");
            form.append("patientId", user?.linkedPatientIds?.[0] || user?.uid || "demo-patient");
            await api.post("/descriptions/voice", form);
            // eslint-disable-next-line no-console
            console.log("Grabación enviada", { duration });
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error("Error subiendo audio", e);
        }
    };
    if (!canRecord) {
        return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(Alert, { status: "warning", children: [_jsx(AlertIcon, {}), "No tienes permisos para grabar descripciones con tu rol actual."] }) })] })] }));
    }
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Heading, { color: "whiteAlpha.900", mb: 2, children: "\uD83C\uDFA4 Describir por Voz" }), _jsx(Text, { color: "blue.600", children: "Graba una descripci\u00F3n detallada de la foto seleccionada usando tu voz." })] }), _jsx(Card, { children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, children: [_jsx(Text, { fontWeight: "bold", children: "\uD83D\uDCF8 Selecciona una foto para describir:" }), _jsx(Box, { p: 4, border: "2px dashed", borderColor: "gray.300", borderRadius: "md", cursor: "pointer", _hover: { borderColor: "blue.400" }, onClick: () => setSelectedPhoto("demo-photo-1"), children: _jsxs(VStack, { spacing: 2, children: [_jsx(Image, { src: "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Foto+de+Familia", alt: "Foto de ejemplo", boxSize: "200px", objectFit: "cover", borderRadius: "md" }), _jsx(Text, { fontSize: "sm", color: "blue.600", children: "Haz clic para seleccionar esta foto" })] }) }), selectedPhoto && (_jsxs(Alert, { status: "success", children: [_jsx(AlertIcon, {}), "Foto seleccionada. Ahora puedes grabar tu descripci\u00F3n."] }))] }) }) }), selectedPhoto && (_jsx(VoiceRecorder, { onRecordingComplete: handleRecordingComplete, maxDurationSeconds: 300, patientId: user?.linkedPatientIds?.[0] || user?.uid || "demo-patient", photoId: selectedPhoto }))] }) })] })] }));
}
