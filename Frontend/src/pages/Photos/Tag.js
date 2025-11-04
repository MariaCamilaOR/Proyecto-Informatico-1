import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Heading, Text, Flex, VStack, Card, CardBody, Button, Alert, AlertIcon } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { PhotoTagger } from "../../components/PhotoTagging/PhotoTagger";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { useState } from "react";
import { FaTag } from "react-icons/fa";
export default function PhotosTag() {
    const { user } = useAuth();
    const [isTaggingActive, setIsTaggingActive] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const canTag = !!user && (hasPermission(user.role, "upload_photos") || hasPermission(user.role, "upload_photos_for_patient"));
    const handleStartTagging = () => {
        setSelectedPhoto({
            id: "demo-photo-tag",
            url: "https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Foto+para+Etiquetar",
            tags: [
                { id: "tag-1", type: "person", value: "María", confidence: 0.9 },
                { id: "tag-2", type: "place", value: "Casa", confidence: 0.8 },
            ],
            description: "Foto de María en casa",
            dateTaken: "2024-01-15",
            location: "Bogotá, Colombia",
        });
        setIsTaggingActive(true);
    };
    const handleSaveMetadata = (metadata) => {
        console.log("Metadatos guardados:", metadata);
        setIsTaggingActive(false);
        setSelectedPhoto(null);
    };
    const handleCancelTagging = () => {
        setIsTaggingActive(false);
        setSelectedPhoto(null);
    };
    if (!canTag) {
        return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(Alert, { status: "warning", children: [_jsx(AlertIcon, {}), "No tienes permisos para etiquetar fotos con tu rol actual."] }) })] })] }));
    }
    if (isTaggingActive && selectedPhoto) {
        return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsx(PhotoTagger, { photo: selectedPhoto, onSave: handleSaveMetadata, onCancel: handleCancelTagging, canEdit: true }) })] })] }));
    }
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Heading, { mb: 2, children: "\uD83C\uDFF7\uFE0F Etiquetar Fotos" }), _jsx(Text, { color: "blue.600", children: "Organiza tus fotos agregando etiquetas y metadatos." })] }), _jsx(Card, { children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, children: [_jsx(Text, { fontWeight: "bold", fontSize: "lg", children: "Selecciona una foto para etiquetar:" }), _jsx(Box, { p: 4, border: "2px dashed", borderColor: "blue.300", borderRadius: "md", cursor: "pointer", _hover: { borderColor: "blue.400" }, onClick: handleStartTagging, children: _jsxs(VStack, { spacing: 2, children: [_jsx("img", { src: "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Foto+para+Etiquetar", alt: "Foto de ejemplo", style: { width: "100%", maxWidth: "320px", height: 150, objectFit: "cover", borderRadius: "8px" } }), _jsx(Text, { fontSize: "sm", color: "blue.600", children: "Haz clic para etiquetar esta foto" })] }) }), _jsx(Button, { leftIcon: _jsx(FaTag, {}), colorScheme: "blue", size: "lg", onClick: handleStartTagging, children: "\uD83C\uDFF7\uFE0F Iniciar Etiquetado" })] }) }) })] }) })] })] }));
}
