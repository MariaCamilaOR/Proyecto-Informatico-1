import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Heading, Text, Flex, VStack, HStack, Button, Badge, useToast } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { PhotoGallery } from "../../components/PhotoGallery/PhotoGallery";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { FaPlus, FaFilter } from "react-icons/fa";
import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { useNavigate } from "react-router-dom";
export default function PhotosList() {
    const { user } = useAuth();
    const [photos, setPhotos] = useState([]);
    const toast = useToast();
    const nav = useNavigate();
    const loadPhotos = async () => {
        try {
            const patientId = user?.linkedPatientIds?.[0] || "demo-patient-123";
            const resp = await api.get(`/photos/patient/${patientId}`);
            setPhotos(resp.data || []);
        }
        catch (e) {
            console.error("PhotosList loadPhotos error:", e?.response?.status, e?.response?.data || e.message || e);
        }
    };
    useEffect(() => {
        loadPhotos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid]);
    const canViewPhotos = !!user && (hasPermission(user.role, "view_own_photos") || hasPermission(user.role, "view_linked_patients"));
    const canEditPhotos = !!user && (hasPermission(user.role, "upload_photos") || hasPermission(user.role, "upload_photos_for_patient"));
    const handleEditPhoto = (photo) => {
        toast({ title: "Editar foto", description: `Editando foto ${photo.id}`, status: "info", duration: 2000 });
    };
    const handleDeletePhoto = (photoId) => {
        (async () => {
            try {
                await api.delete(`/photos/${photoId}`);
                toast({ title: "Foto eliminada", description: `Se eliminó la foto ${photoId}`, status: "success", duration: 2000 });
                loadPhotos();
            }
            catch (e) {
                console.error("delete photo error", e);
                toast({
                    title: "Error",
                    description: `No se pudo eliminar la foto: ${e?.response?.data?.error || e.message || e}`,
                    status: "error",
                    duration: 4000,
                });
            }
        })();
    };
    const handleTagPhoto = (photo) => {
        toast({ title: "Etiquetar foto", description: `Etiquetando foto ${photo.id}`, status: "info", duration: 2000 });
    };
    if (!canViewPhotos) {
        return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsx(Text, { children: "No tienes permisos para ver fotos con tu rol actual." }) })] })] }));
    }
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(Flex, { justify: "space-between", align: "center", children: [_jsxs(Box, { children: [_jsx(Heading, { mb: 2, children: "\uD83D\uDCF8 Galer\u00EDa de Fotos" }), _jsx(Text, { color: "blue.600", children: "Tus fotos familiares y recuerdos importantes" })] }), _jsxs(HStack, { spacing: 3, children: [_jsx(Button, { leftIcon: _jsx(FaFilter, {}), variant: "outline", size: "sm", children: "Filtrar" }), canEditPhotos && (_jsx(Button, { leftIcon: _jsx(FaPlus, {}), colorScheme: "blue", size: "sm", onClick: () => nav("/photos/upload"), children: "Subir Fotos" }))] })] }), _jsxs(HStack, { spacing: 4, children: [_jsxs(Badge, { colorScheme: "blue", p: 2, borderRadius: "md", children: ["Total: ", photos.length, " fotos"] }), _jsx(Badge, { colorScheme: "green", p: 2, borderRadius: "md", children: "Descritas: 1" }), _jsx(Badge, { colorScheme: "orange", p: 2, borderRadius: "md", children: "Sin describir: 2" })] }), _jsx(PhotoGallery, { photos: photos, onEditPhoto: handleEditPhoto, onDeletePhoto: handleDeletePhoto, onTagPhoto: handleTagPhoto, canEdit: canEditPhotos, canDelete: canEditPhotos }), photos.length === 0 && (_jsxs(Box, { textAlign: "center", py: 8, children: [_jsx(Text, { fontSize: "lg", color: "blue.500", mb: 4, children: "No tienes fotos subidas a\u00FAn" }), canEditPhotos && (_jsx(Button, { leftIcon: _jsx(FaPlus, {}), colorScheme: "blue", onClick: () => nav("/photos/upload"), children: "Subir tu primera foto" }))] }))] }) })] })] }));
}
