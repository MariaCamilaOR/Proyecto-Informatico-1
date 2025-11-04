import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, VStack, HStack, Text, Card, CardBody, Button, Input, Badge, IconButton, Image, FormControl, FormLabel, Textarea, Select, Divider, useToast, Alert, AlertIcon } from "@chakra-ui/react";
import { FaTag, FaPlus, FaTimes, FaUser, FaMapMarkerAlt, FaCalendarAlt, FaHeart } from "react-icons/fa";
export function PhotoTagger({ photo, onSave, onCancel, canEdit = true }) {
    const [metadata, setMetadata] = useState(photo);
    const [newTag, setNewTag] = useState("");
    const [selectedTagType, setSelectedTagType] = useState("person");
    const [isEditing, setIsEditing] = useState(false);
    const toast = useToast();
    const tagTypes = [
        { value: "person", label: "Persona", icon: _jsx(FaUser, {}), color: "blue" },
        { value: "place", label: "Lugar", icon: _jsx(FaMapMarkerAlt, {}), color: "green" },
        { value: "object", label: "Objeto", icon: _jsx(FaTag, {}), color: "purple" },
        { value: "event", label: "Evento", icon: _jsx(FaCalendarAlt, {}), color: "orange" },
        { value: "emotion", label: "Emoción", icon: _jsx(FaHeart, {}), color: "red" }
    ];
    const addTag = () => {
        if (newTag.trim()) {
            const tag = {
                id: `tag-${Date.now()}`,
                type: selectedTagType,
                value: newTag.trim(),
                confidence: 1.0
            };
            setMetadata(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
            setNewTag("");
            toast({
                title: "Etiqueta agregada",
                description: `${newTag} agregado como ${tagTypes.find(t => t.value === selectedTagType)?.label}`,
                status: "success",
                duration: 2000,
            });
        }
    };
    const removeTag = (tagId) => {
        setMetadata(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag.id !== tagId)
        }));
    };
    const updateMetadata = (field, value) => {
        setMetadata(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const handleSave = () => {
        onSave(metadata);
        toast({
            title: "Metadatos guardados",
            description: "La información de la foto ha sido actualizada",
            status: "success",
            duration: 3000,
        });
    };
    const getTagColor = (type) => {
        return tagTypes.find(t => t.value === type)?.color || "gray";
    };
    const getTagIcon = (type) => {
        return tagTypes.find(t => t.value === type)?.icon || _jsx(FaTag, {});
    };
    const groupedTags = metadata.tags.reduce((acc, tag) => {
        if (!acc[tag.type]) {
            acc[tag.type] = [];
        }
        acc[tag.type].push(tag);
        return acc;
    }, {});
    return (_jsxs(VStack, { spacing: 6, w: "full", children: [_jsx(Card, { w: "full", children: _jsx(CardBody, { children: _jsxs(HStack, { justify: "space-between", children: [_jsxs(VStack, { align: "start", spacing: 1, children: [_jsx(Text, { fontSize: "2xl", fontWeight: "bold", children: "\uD83C\uDFF7\uFE0F Etiquetar Foto" }), _jsx(Text, { color: "gray.600", children: "Agrega metadatos y etiquetas para organizar mejor tus fotos" })] }), _jsxs(HStack, { spacing: 2, children: [_jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancelar" }), _jsx(Button, { colorScheme: "blue", onClick: handleSave, children: "Guardar" })] })] }) }) }), _jsxs(HStack, { spacing: 6, w: "full", align: "start", children: [_jsx(Card, { flex: "1", children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, children: [_jsx(Image, { src: metadata.url, alt: "Foto a etiquetar", maxH: "400px", objectFit: "cover", borderRadius: "md" }), _jsxs(Text, { fontSize: "sm", color: "gray.500", children: ["ID: ", metadata.id] })] }) }) }), _jsx(Card, { flex: "1", children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Text, { fontWeight: "bold", mb: 3, children: "Agregar Etiqueta" }), _jsxs(VStack, { spacing: 3, children: [_jsx(HStack, { w: "full", children: _jsx(Select, { value: selectedTagType, onChange: (e) => setSelectedTagType(e.target.value), size: "sm", children: tagTypes.map(type => (_jsx("option", { value: type.value, children: type.label }, type.value))) }) }), _jsxs(HStack, { w: "full", children: [_jsx(Input, { placeholder: `Agregar ${tagTypes.find(t => t.value === selectedTagType)?.label.toLowerCase()}...`, value: newTag, onChange: (e) => setNewTag(e.target.value), onKeyPress: (e) => e.key === 'Enter' && addTag() }), _jsx(IconButton, { "aria-label": "Agregar etiqueta", icon: _jsx(FaPlus, {}), colorScheme: "blue", onClick: addTag })] })] })] }), _jsx(Divider, {}), _jsxs(Box, { children: [_jsxs(Text, { fontWeight: "bold", mb: 3, children: ["Etiquetas (", metadata.tags.length, ")"] }), metadata.tags.length === 0 ? (_jsxs(Alert, { status: "info", children: [_jsx(AlertIcon, {}), _jsx(Text, { fontSize: "sm", children: "No hay etiquetas. Agrega algunas para organizar mejor esta foto." })] })) : (_jsx(VStack, { spacing: 3, align: "stretch", children: Object.entries(groupedTags).map(([type, tags]) => (_jsxs(Box, { children: [_jsxs(HStack, { mb: 2, children: [getTagIcon(type), _jsxs(Text, { fontWeight: "bold", fontSize: "sm", textTransform: "capitalize", children: [tagTypes.find(t => t.value === type)?.label, " (", tags.length, ")"] })] }), _jsx(HStack, { spacing: 2, flexWrap: "wrap", children: tags.map(tag => (_jsx(Badge, { colorScheme: getTagColor(tag.type), p: 2, borderRadius: "md", children: _jsxs(HStack, { spacing: 1, children: [_jsx(Text, { children: tag.value }), canEdit && (_jsx(IconButton, { "aria-label": "Eliminar etiqueta", icon: _jsx(FaTimes, {}), size: "xs", variant: "ghost", color: "white", onClick: () => removeTag(tag.id) }))] }) }, tag.id))) })] }, type))) }))] }), _jsx(Divider, {}), _jsxs(Box, { children: [_jsx(Text, { fontWeight: "bold", mb: 3, children: "Informaci\u00F3n Adicional" }), _jsxs(VStack, { spacing: 3, children: [_jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Descripci\u00F3n:" }), _jsx(Textarea, { placeholder: "Describe brevemente esta foto...", value: metadata.description || "", onChange: (e) => updateMetadata("description", e.target.value), rows: 3 })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Fecha tomada:" }), _jsx(Input, { type: "date", value: metadata.dateTaken || "", onChange: (e) => updateMetadata("dateTaken", e.target.value) })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Ubicaci\u00F3n:" }), _jsx(Input, { placeholder: "\u00BFD\u00F3nde fue tomada esta foto?", value: metadata.location || "", onChange: (e) => updateMetadata("location", e.target.value) })] })] })] })] }) }) })] }), _jsx(Card, { w: "full", children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 3, align: "start", children: [_jsx(Text, { fontWeight: "bold", children: "\uD83D\uDCA1 Sugerencias de etiquetas:" }), _jsxs(VStack, { spacing: 2, align: "start", fontSize: "sm", color: "gray.600", children: [_jsxs(Text, { children: ["\u2022 ", _jsx("strong", { children: "Personas:" }), " Nombres de familiares, amigos, conocidos"] }), _jsxs(Text, { children: ["\u2022 ", _jsx("strong", { children: "Lugares:" }), " Casa, parque, restaurante, ciudad, pa\u00EDs"] }), _jsxs(Text, { children: ["\u2022 ", _jsx("strong", { children: "Objetos:" }), " Comida, ropa, muebles, veh\u00EDculos, regalos"] }), _jsxs(Text, { children: ["\u2022 ", _jsx("strong", { children: "Eventos:" }), " Cumplea\u00F1os, bodas, vacaciones, reuniones"] }), _jsxs(Text, { children: ["\u2022 ", _jsx("strong", { children: "Emociones:" }), " Feliz, nost\u00E1lgico, emocionado, tranquilo"] })] })] }) }) })] }));
}
