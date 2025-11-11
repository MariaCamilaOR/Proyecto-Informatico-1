import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Box, Heading, Text, Flex, VStack, HStack, Card, CardBody, Button, Alert, AlertIcon, Image, IconButton, } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { DescriptionWizard } from "../../components/PhotoDescription/DescriptionWizard";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { api } from "../../api";
import { useToast } from "@chakra-ui/react";
export default function DescribeWizard() {
    const { user } = useAuth();
    const [isWizardActive, setIsWizardActive] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const toast = useToast();
    const [photos, setPhotos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const canDescribe = !!user && hasPermission(user.role, "describe_photos");
    const handleStartWizard = () => {
        // default to first uploaded photo if available
        const p = photos.length > 0 ? photos[0] : {
            id: "demo-photo-wizard",
            url: "https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Foto+de+Familia+Demo",
            patientId: user?.linkedPatientIds?.[0] || user?.uid || "demo-patient",
        };
        setSelectedPhoto(p);
        setIsWizardActive(true);
    };
    // Load user's photos for selection
    useEffect(() => {
        (async () => {
            try {
                if (!user)
                    return;
                const patientId = user.linkedPatientIds?.[0] || user.uid || "demo-patient";
                const resp = await api.get(`/photos/patient/${patientId}`);
                const items = (resp.data || []).map((it) => ({ id: it.id, url: it.url, patientId: it.patientId }));
                setPhotos(items);
                setCurrentIndex(0);
            }
            catch (err) {
                // ignore — user may not have photos yet
                // eslint-disable-next-line no-console
                console.warn("Failed to load photos for wizard selection", err);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid]);
    // keyboard navigation for convenience
    useEffect(() => {
        const onKey = (e) => {
            if (!photos || photos.length === 0)
                return;
            if (e.key === "ArrowLeft")
                setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
            if (e.key === "ArrowRight")
                setCurrentIndex((i) => (i + 1) % photos.length);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [photos]);
    const handleWizardComplete = (data) => {
        (async () => {
            try {
                const patientId = user?.linkedPatientIds?.[0] || user?.uid || "demo-patient";
                await api.post("/descriptions/wizard", { patientId, photoId: selectedPhoto?.id, data });
                toast({ title: "Descripción guardada", status: "success", duration: 3000 });
            }
            catch (err) {
                console.error("Failed to save wizard description", err);
                toast({ title: "Error al guardar", description: err?.response?.data?.error || err?.message || String(err), status: "error", duration: 4000 });
            }
            finally {
                setIsWizardActive(false);
                setSelectedPhoto(null);
            }
        })();
    };
    const handleWizardCancel = () => {
        setIsWizardActive(false);
        setSelectedPhoto(null);
    };
    if (!canDescribe) {
        return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(Alert, { status: "warning", children: [_jsx(AlertIcon, {}), "No tienes permisos para describir fotos con tu rol actual."] }) })] })] }));
    }
    if (isWizardActive && selectedPhoto) {
        return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsx(DescriptionWizard, { photo: selectedPhoto, onComplete: handleWizardComplete, onCancel: handleWizardCancel }) })] })] }));
    }
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Heading, { color: "whiteAlpha.900", mb: 2, children: "\uD83E\uDDD9\u200D\u2642\uFE0F Asistente de Descripci\u00F3n" }), _jsx(Text, { color: "blue.600", children: "Te guiaremos paso a paso para describir tus fotos de manera detallada." })] }), _jsx(Card, { children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, children: [_jsx(Text, { fontWeight: "bold", fontSize: "lg", children: "\u00BFC\u00F3mo funciona el asistente?" }), _jsxs(VStack, { spacing: 3, align: "start", w: "full", children: [_jsxs(Text, { fontSize: "sm", color: "blue.600", children: [_jsx("strong", { children: "Paso 1:" }), " Identifica las personas en la foto"] }), _jsxs(Text, { fontSize: "sm", color: "blue.600", children: [_jsx("strong", { children: "Paso 2:" }), " Menciona los lugares donde fue tomada"] }), _jsxs(Text, { fontSize: "sm", color: "blue.600", children: [_jsx("strong", { children: "Paso 3:" }), " Describe el evento o situaci\u00F3n"] }), _jsxs(Text, { fontSize: "sm", color: "blue.600", children: [_jsx("strong", { children: "Paso 4:" }), " Comparte tus emociones y recuerdos"] }), _jsxs(Text, { fontSize: "sm", color: "blue.600", children: [_jsx("strong", { children: "Paso 5:" }), " Agrega detalles adicionales"] })] })] }) }) }), _jsx(Card, { children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, children: [_jsx(Text, { fontWeight: "bold", children: "\uD83D\uDCF8 Selecciona una foto para describir:" }), photos.length > 0 ? (_jsxs(VStack, { spacing: 3, w: "full", align: "center", children: [_jsx(Text, { fontSize: "sm", color: "gray.600", children: "Elige una foto subida por ti:" }), _jsxs(VStack, { spacing: 3, align: "center", children: [_jsxs(HStack, { spacing: 4, align: "center", children: [_jsx(IconButton, { "aria-label": "Anterior", icon: _jsx("span", { children: "\u25C0" }), onClick: () => setCurrentIndex((i) => (i - 1 + photos.length) % photos.length) }), _jsxs(Box, { children: [_jsx(Image, { src: photos[currentIndex].url, alt: `Foto ${photos[currentIndex].id}`, maxW: "640px", w: "100%", objectFit: "cover", borderRadius: "md" }), _jsxs(Text, { fontSize: "xs", color: "gray.500", mt: 2, children: ["ID: ", photos[currentIndex].id] })] }), _jsx(IconButton, { "aria-label": "Siguiente", icon: _jsx("span", { children: "\u25B6" }), onClick: () => setCurrentIndex((i) => (i + 1) % photos.length) })] }), _jsxs(Text, { fontSize: "sm", color: "gray.600", children: [currentIndex + 1, " / ", photos.length] }), _jsx(HStack, { spacing: 2, overflowX: "auto", w: "full", px: 2, py: 1, children: photos.map((tp, idx) => (_jsx(Box, { borderRadius: "md", cursor: "pointer", border: idx === currentIndex ? '2px solid' : '1px solid', borderColor: idx === currentIndex ? 'blue.300' : 'transparent', p: 1, onClick: () => setCurrentIndex(idx), children: _jsx(Image, { src: tp.url, alt: `thumb-${tp.id}`, boxSize: "80px", objectFit: "cover", borderRadius: "sm" }) }, tp.id))) }), _jsx(Button, { mt: 3, colorScheme: "blue", onClick: () => { setSelectedPhoto(photos[currentIndex]); setIsWizardActive(true); }, children: "Describir esta foto" })] })] })) : (_jsx(Box, { p: 4, border: "2px dashed", borderColor: "gray.300", borderRadius: "md", cursor: "pointer", _hover: { borderColor: "blue.400" }, onClick: handleStartWizard, children: _jsxs(VStack, { spacing: 2, children: [_jsx(Image, { src: "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Foto+de+Familia", alt: "Foto de ejemplo", boxSize: "200px", objectFit: "cover", borderRadius: "md" }), _jsx(Text, { fontSize: "sm", color: "blue.600", children: "Haz clic para describir esta foto" })] }) }))] }) }) })] }) })] })] }));
}
