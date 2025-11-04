import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Grid, Image, Text, Badge, HStack, VStack, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, IconButton, Tooltip, Card, CardBody, Flex, Spacer } from "@chakra-ui/react";
import { FaEye, FaEdit, FaTrash, FaTag, FaCalendarAlt, FaUser } from "react-icons/fa";
export function PhotoGallery({ photos, onEditPhoto, onDeletePhoto, onTagPhoto, canEdit = false, canDelete = false }) {
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const handlePhotoClick = (photo) => {
        setSelectedPhoto(photo);
        onOpen();
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    const getPhotoStatus = (photo) => {
        if (photo.description) {
            return { label: "Descrita", color: "green" };
        }
        return { label: "Sin describir", color: "orange" };
    };
    // Fotos demo si no hay fotos reales
    const demoPhotos = photos.length > 0 ? photos : [
        {
            id: "demo-1",
            patientId: "demo-patient",
            storagePath: "demo/path/1",
            tags: ["familia", "cumpleaños"],
            createdAt: "2024-01-15T10:00:00Z",
            description: "Foto de mi cumpleaños con toda la familia",
            uploadedBy: "Cuidador"
        },
        {
            id: "demo-2",
            patientId: "demo-patient",
            storagePath: "demo/path/2",
            tags: ["vacaciones", "playa"],
            createdAt: "2024-01-10T15:30:00Z",
            uploadedBy: "Paciente"
        },
        {
            id: "demo-3",
            patientId: "demo-patient",
            storagePath: "demo/path/3",
            tags: ["amigos", "reunión"],
            createdAt: "2024-01-05T20:00:00Z",
            description: "Reunión con mis amigos de la universidad",
            uploadedBy: "Cuidador"
        }
    ];
    return (_jsxs(Box, { children: [_jsx(Grid, { templateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 4, children: demoPhotos.map((photo) => {
                    const status = getPhotoStatus(photo);
                    return (_jsxs(Card, { overflow: "hidden", cursor: "pointer", _hover: { shadow: "lg" }, children: [_jsxs(Box, { position: "relative", children: [_jsx(Image, { src: 
                                        // prefer actual url from backend, otherwise placeholder
                                        photo.url || `https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Foto+${photo.id}`, alt: `Foto ${photo.id}`, w: "full", h: "200px", objectFit: "cover", onClick: () => handlePhotoClick(photo) }), _jsx(Box, { position: "absolute", top: 0, left: 0, right: 0, bg: "blackAlpha.600", color: "white", p: 2, opacity: 0, _groupHover: { opacity: 1 }, transition: "opacity 0.2s", children: _jsxs(HStack, { justify: "space-between", children: [_jsx(Badge, { colorScheme: status.color, size: "sm", children: status.label }), _jsxs(HStack, { spacing: 1, children: [_jsx(Tooltip, { label: "Ver detalles", children: _jsx(IconButton, { "aria-label": "Ver", icon: _jsx(FaEye, {}), size: "sm", variant: "ghost", color: "white", onClick: (e) => {
                                                                    e.stopPropagation();
                                                                    handlePhotoClick(photo);
                                                                } }) }), canEdit && (_jsx(Tooltip, { label: "Editar", children: _jsx(IconButton, { "aria-label": "Editar", icon: _jsx(FaEdit, {}), size: "sm", variant: "ghost", color: "white", onClick: (e) => {
                                                                    e.stopPropagation();
                                                                    onEditPhoto?.(photo);
                                                                } }) })), canDelete && (_jsx(Tooltip, { label: "Eliminar", children: _jsx(IconButton, { "aria-label": "Eliminar", icon: _jsx(FaTrash, {}), size: "sm", variant: "ghost", color: "red.300", onClick: (e) => {
                                                                    e.stopPropagation();
                                                                    onDeletePhoto?.(photo.id);
                                                                } }) }))] })] }) })] }), _jsx(CardBody, { p: 3, children: _jsxs(VStack, { align: "start", spacing: 2, children: [photo.tags.length > 0 && (_jsxs(HStack, { spacing: 1, flexWrap: "wrap", children: [photo.tags.slice(0, 2).map((tag) => (_jsx(Badge, { size: "sm", colorScheme: "blue", children: tag }, tag))), photo.tags.length > 2 && (_jsxs(Badge, { size: "sm", colorScheme: "gray", children: ["+", photo.tags.length - 2] }))] })), _jsxs(HStack, { spacing: 2, fontSize: "xs", color: "gray.500", children: [_jsxs(HStack, { spacing: 1, children: [_jsx(FaCalendarAlt, {}), _jsx(Text, { children: formatDate(photo.createdAt || '') })] }), _jsxs(HStack, { spacing: 1, children: [_jsx(FaUser, {}), _jsx(Text, { children: photo.uploadedBy || '—' })] })] }), photo.description && (_jsx(Text, { fontSize: "sm", noOfLines: 2, color: "gray.600", children: photo.description })), photo.url && (_jsx(Text, { fontSize: "xs", color: "blue.500", as: "a", href: photo.url, target: "_blank", rel: "noreferrer", children: "Abrir imagen" }))] }) })] }, photo.id));
                }) }), _jsxs(Modal, { isOpen: isOpen, onClose: onClose, size: "xl", children: [_jsx(ModalOverlay, {}), _jsxs(ModalContent, { children: [_jsx(ModalHeader, { children: _jsxs(HStack, { children: [_jsx(Text, { children: "Detalles de la Foto" }), selectedPhoto && (_jsx(Badge, { colorScheme: getPhotoStatus(selectedPhoto).color, children: getPhotoStatus(selectedPhoto).label }))] }) }), _jsx(ModalCloseButton, {}), _jsx(ModalBody, { pb: 6, children: selectedPhoto && (_jsxs(VStack, { spacing: 4, children: [_jsx(Image, { src: selectedPhoto.url || `https://via.placeholder.com/500x300/4A90E2/FFFFFF?text=Foto+${selectedPhoto.id}`, alt: `Foto ${selectedPhoto.id}`, w: "full", maxH: "300px", objectFit: "cover", borderRadius: "md" }), _jsxs(VStack, { spacing: 3, w: "full", align: "start", children: [selectedPhoto.tags.length > 0 && (_jsxs(Box, { children: [_jsx(Text, { fontWeight: "bold", mb: 2, children: "\uD83C\uDFF7\uFE0F Etiquetas:" }), _jsx(HStack, { spacing: 2, flexWrap: "wrap", children: selectedPhoto.tags.map((tag) => (_jsx(Badge, { colorScheme: "blue", p: 2, children: tag }, tag))) })] })), selectedPhoto.description ? (_jsxs(Box, { children: [_jsx(Text, { fontWeight: "bold", mb: 2, children: "\uD83D\uDCDD Descripci\u00F3n:" }), _jsx(Text, { children: selectedPhoto.description })] })) : (_jsxs(Box, { children: [_jsx(Text, { fontWeight: "bold", mb: 2, children: "\uD83D\uDCDD Descripci\u00F3n:" }), _jsx(Text, { color: "gray.500", fontStyle: "italic", children: "Esta foto a\u00FAn no tiene descripci\u00F3n" })] })), _jsxs(Box, { children: [_jsx(Text, { fontWeight: "bold", mb: 2, children: "\u2139\uFE0F Informaci\u00F3n:" }), _jsxs(VStack, { align: "start", spacing: 1, fontSize: "sm", color: "gray.600", children: [_jsxs(HStack, { children: [_jsx(FaCalendarAlt, {}), _jsxs(Text, { children: ["Subida: ", formatDate(selectedPhoto.createdAt)] })] }), _jsxs(HStack, { children: [_jsx(FaUser, {}), _jsxs(Text, { children: ["Subida por: ", selectedPhoto.uploadedBy] })] })] })] }), _jsxs(Flex, { w: "full", gap: 2, children: [_jsx(Button, { leftIcon: _jsx(FaTag, {}), colorScheme: "blue", variant: "outline", onClick: () => onTagPhoto?.(selectedPhoto), children: "Etiquetar" }), canEdit && (_jsx(Button, { leftIcon: _jsx(FaEdit, {}), colorScheme: "green", variant: "outline", onClick: () => onEditPhoto?.(selectedPhoto), children: "Editar" })), _jsx(Spacer, {}), canDelete && (_jsx(Button, { leftIcon: _jsx(FaTrash, {}), colorScheme: "red", variant: "outline", onClick: () => {
                                                                onDeletePhoto?.(selectedPhoto.id);
                                                                onClose();
                                                            }, children: "Eliminar" }))] })] })] })) })] })] })] }));
}
