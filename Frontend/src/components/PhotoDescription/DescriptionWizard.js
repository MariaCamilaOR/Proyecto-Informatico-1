import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, VStack, HStack, Text, Button, Progress, Card, CardBody, Image, FormControl, FormLabel, Textarea, Input, Badge, Alert, AlertIcon, Divider, IconButton, useToast, } from "@chakra-ui/react";
import { FaArrowLeft, FaArrowRight, FaCheck, FaTag, FaUser, FaMapMarkerAlt, FaCalendarAlt, FaTimes, } from "react-icons/fa";
export function DescriptionWizard({ photo, onComplete, onCancel }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [descriptionData, setDescriptionData] = useState({
        people: [],
        places: [],
        events: "",
        emotions: "",
        details: "",
        tags: [],
    });
    const [newPerson, setNewPerson] = useState("");
    const [newPlace, setNewPlace] = useState("");
    const [newTag, setNewTag] = useState("");
    const toast = useToast();
    const steps = [
        {
            id: "people",
            title: "Personas en la foto",
            description: "¿Quiénes aparecen en esta foto?",
            icon: _jsx(FaUser, {}),
        },
        {
            id: "places",
            title: "Lugares",
            description: "¿Dónde fue tomada esta foto?",
            icon: _jsx(FaMapMarkerAlt, {}),
        },
        {
            id: "events",
            title: "Evento o situación",
            description: "¿Qué está pasando en la foto?",
            icon: _jsx(FaCalendarAlt, {}),
        },
        {
            id: "emotions",
            title: "Emociones y recuerdos",
            description: "¿Cómo te sientes al ver esta foto?",
            icon: _jsx(FaTag, {}),
        },
        {
            id: "details",
            title: "Detalles adicionales",
            description: "¿Hay algo más que quieras agregar?",
            icon: _jsx(FaCheck, {}),
        },
    ];
    const progress = ((currentStep + 1) / steps.length) * 100;
    const addUnique = (arr, value) => value.trim() && !arr.includes(value.trim()) ? [...arr, value.trim()] : arr;
    const addPerson = () => {
        setDescriptionData((prev) => ({ ...prev, people: addUnique(prev.people, newPerson) }));
        setNewPerson("");
    };
    const removePerson = (person) => setDescriptionData((prev) => ({ ...prev, people: prev.people.filter((p) => p !== person) }));
    const addPlace = () => {
        setDescriptionData((prev) => ({ ...prev, places: addUnique(prev.places, newPlace) }));
        setNewPlace("");
    };
    const removePlace = (place) => setDescriptionData((prev) => ({ ...prev, places: prev.places.filter((p) => p !== place) }));
    const addTag = () => {
        setDescriptionData((prev) => ({ ...prev, tags: addUnique(prev.tags, newTag) }));
        setNewTag("");
    };
    const removeTag = (tag) => setDescriptionData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((s) => s + 1);
        }
        else {
            onComplete(descriptionData);
            toast({
                title: "Descripción completada",
                description: "Tu descripción ha sido guardada exitosamente",
                status: "success",
                duration: 3000,
            });
        }
    };
    const prevStep = () => currentStep > 0 && setCurrentStep((s) => s - 1);
    const renderStepContent = () => {
        const step = steps[currentStep];
        if (step.id === "people") {
            return (_jsxs(VStack, { spacing: 4, w: "full", children: [_jsx(Text, { fontSize: "sm", color: "gray.600", textAlign: "center", children: "Menciona todas las personas que reconozcas en la foto" }), _jsxs(HStack, { w: "full", children: [_jsx(Input, { placeholder: "Nombre de la persona", value: newPerson, onChange: (e) => setNewPerson(e.target.value), onKeyDown: (e) => e.key === "Enter" && addPerson() }), _jsx(Button, { onClick: addPerson, colorScheme: "blue", children: "Agregar" })] }), descriptionData.people.length > 0 && (_jsxs(VStack, { spacing: 2, w: "full", children: [_jsx(Text, { fontWeight: "bold", children: "Personas identificadas:" }), _jsx(HStack, { spacing: 2, flexWrap: "wrap", children: descriptionData.people.map((person) => (_jsx(Badge, { colorScheme: "blue", p: 2, borderRadius: "md", children: _jsxs(HStack, { spacing: 2, children: [_jsx(Text, { children: person }), _jsx(IconButton, { "aria-label": "Eliminar", size: "xs", variant: "ghost", icon: _jsx(FaTimes, {}), onClick: () => removePerson(person) })] }) }, person))) })] }))] }));
        }
        if (step.id === "places") {
            return (_jsxs(VStack, { spacing: 4, w: "full", children: [_jsx(Text, { fontSize: "sm", color: "gray.600", textAlign: "center", children: "\u00BFD\u00F3nde fue tomada esta foto?" }), _jsxs(HStack, { w: "full", children: [_jsx(Input, { placeholder: "Lugar (ej: casa, parque, restaurante)", value: newPlace, onChange: (e) => setNewPlace(e.target.value), onKeyDown: (e) => e.key === "Enter" && addPlace() }), _jsx(Button, { onClick: addPlace, colorScheme: "green", children: "Agregar" })] }), descriptionData.places.length > 0 && (_jsxs(VStack, { spacing: 2, w: "full", children: [_jsx(Text, { fontWeight: "bold", children: "Lugares identificados:" }), _jsx(HStack, { spacing: 2, flexWrap: "wrap", children: descriptionData.places.map((place) => (_jsx(Badge, { colorScheme: "green", p: 2, borderRadius: "md", children: _jsxs(HStack, { spacing: 2, children: [_jsx(Text, { children: place }), _jsx(IconButton, { "aria-label": "Eliminar", size: "xs", variant: "ghost", icon: _jsx(FaTimes, {}), onClick: () => removePlace(place) })] }) }, place))) })] }))] }));
        }
        if (step.id === "events") {
            return (_jsxs(VStack, { spacing: 4, w: "full", children: [_jsx(Text, { fontSize: "sm", color: "gray.600", textAlign: "center", children: "Describe qu\u00E9 est\u00E1 pasando en la foto" }), _jsxs(FormControl, { children: [_jsx(FormLabel, { children: "Evento o situaci\u00F3n:" }), _jsx(Textarea, { placeholder: "Ej: Cumplea\u00F1os, reuni\u00F3n familiar, vacaciones, celebraci\u00F3n...", value: descriptionData.events, onChange: (e) => setDescriptionData((p) => ({ ...p, events: e.target.value })), rows: 4 })] })] }));
        }
        if (step.id === "emotions") {
            return (_jsxs(VStack, { spacing: 4, w: "full", children: [_jsx(Text, { fontSize: "sm", color: "gray.600", textAlign: "center", children: "\u00BFQu\u00E9 emociones o recuerdos te trae esta foto?" }), _jsxs(FormControl, { children: [_jsx(FormLabel, { children: "Emociones y recuerdos:" }), _jsx(Textarea, { placeholder: "Ej: Me siento feliz, me recuerda a mi infancia, me da nostalgia...", value: descriptionData.emotions, onChange: (e) => setDescriptionData((p) => ({ ...p, emotions: e.target.value })), rows: 4 })] }), _jsxs(VStack, { spacing: 2, w: "full", children: [_jsx(Text, { fontWeight: "bold", children: "Etiquetas adicionales:" }), _jsxs(HStack, { w: "full", children: [_jsx(Input, { placeholder: "Etiqueta (ej: familia, feliz, recuerdo)", value: newTag, onChange: (e) => setNewTag(e.target.value), onKeyDown: (e) => e.key === "Enter" && addTag() }), _jsx(Button, { onClick: addTag, colorScheme: "purple", children: "Agregar" })] }), descriptionData.tags.length > 0 && (_jsx(HStack, { spacing: 2, flexWrap: "wrap", children: descriptionData.tags.map((tag) => (_jsx(Badge, { colorScheme: "purple", p: 2, borderRadius: "md", children: _jsxs(HStack, { spacing: 2, children: [_jsx(Text, { children: tag }), _jsx(IconButton, { "aria-label": "Eliminar", size: "xs", variant: "ghost", icon: _jsx(FaTimes, {}), onClick: () => removeTag(tag) })] }) }, tag))) }))] })] }));
        }
        // details
        return (_jsxs(VStack, { spacing: 4, w: "full", children: [_jsx(Text, { fontSize: "sm", color: "gray.600", textAlign: "center", children: "\u00BFHay algo m\u00E1s que quieras agregar a tu descripci\u00F3n?" }), _jsxs(FormControl, { children: [_jsx(FormLabel, { children: "Detalles adicionales:" }), _jsx(Textarea, { placeholder: "Cualquier detalle adicional que quieras recordar...", value: descriptionData.details, onChange: (e) => setDescriptionData((p) => ({ ...p, details: e.target.value })), rows: 4 })] }), _jsxs(Alert, { status: "info", children: [_jsx(AlertIcon, {}), _jsx(Text, { fontSize: "sm", children: "Esta informaci\u00F3n ayudar\u00E1 a crear tu l\u00EDnea base y monitorear tu memoria a lo largo del tiempo." })] })] }));
    };
    return (_jsxs(VStack, { spacing: 6, w: "full", children: [_jsxs(Box, { textAlign: "center", w: "full", children: [_jsxs(Text, { fontSize: "2xl", fontWeight: "bold", color: "whiteAlpha.900", mb: 2, children: ["\uD83D\uDCDD Describir Foto - Paso ", currentStep + 1, " de ", steps.length] }), _jsx(Progress, { value: progress, w: "full", colorScheme: "blue", size: "lg" })] }), _jsx(Card, { w: "full", children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, children: [_jsx(Image, { src: photo.url, alt: "Foto a describir", maxH: "300px", objectFit: "cover", borderRadius: "md" }), _jsxs(Text, { fontSize: "sm", color: "gray.500", children: ["Foto ID: ", photo.id] })] }) }) }), _jsx(Card, { w: "full", children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, children: [_jsxs(HStack, { align: "start", spacing: 3, children: [steps[currentStep].icon, _jsxs(VStack, { align: "start", spacing: 1, children: [_jsx(Text, { fontSize: "lg", fontWeight: "bold", color: "whiteAlpha.900", children: steps[currentStep].title }), _jsx(Text, { fontSize: "sm", color: "gray.400", children: steps[currentStep].description })] })] }), _jsx(Divider, {}), renderStepContent()] }) }) }), _jsxs(HStack, { spacing: 4, w: "full", justify: "space-between", children: [_jsx(Button, { leftIcon: _jsx(FaArrowLeft, {}), onClick: prevStep, isDisabled: currentStep === 0, variant: "outline", children: "Anterior" }), _jsx(Button, { onClick: onCancel, variant: "ghost", colorScheme: "red", children: "Cancelar" }), _jsx(Button, { rightIcon: currentStep === steps.length - 1 ? _jsx(FaCheck, {}) : _jsx(FaArrowRight, {}), onClick: nextStep, colorScheme: "blue", children: currentStep === steps.length - 1 ? "Completar" : "Siguiente" })] })] }));
}
