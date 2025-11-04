import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, VStack, HStack, Text, Button, Progress, Card, CardBody, Image, FormControl, FormLabel, Input, Textarea, Select, Checkbox, CheckboxGroup, Stack, Divider, Alert, AlertIcon, Badge, useToast } from "@chakra-ui/react";
import { FaArrowLeft, FaArrowRight, FaCheck, FaUser, FaCamera, FaBrain } from "react-icons/fa";
export function OnboardingWizard({ onComplete, onSkip }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [onboardingData, setOnboardingData] = useState({
        personalInfo: {
            name: "",
            age: 0,
            relationship: ""
        },
        preferences: {
            reminderFrequency: "daily",
            sessionDuration: "15",
            preferredTime: "morning"
        },
        baselinePhotos: [],
        initialDescription: "",
        goals: [],
        completed: false
    });
    const toast = useToast();
    const steps = [
        {
            id: "welcome",
            title: "¡Bienvenido a DoYouRemember!",
            description: "Te ayudaremos a configurar tu perfil",
            icon: _jsx(FaUser, {}),
            required: false
        },
        {
            id: "personal",
            title: "Información Personal",
            description: "Cuéntanos sobre ti",
            icon: _jsx(FaUser, {}),
            required: true
        },
        {
            id: "preferences",
            title: "Preferencias",
            description: "Configura tus recordatorios",
            icon: _jsx(FaBrain, {}),
            required: true
        },
        {
            id: "baseline",
            title: "Línea Base",
            description: "Establece tu punto de partida",
            icon: _jsx(FaCamera, {}),
            required: true
        },
        {
            id: "goals",
            title: "Objetivos",
            description: "Define tus metas",
            icon: _jsx(FaCheck, {}),
            required: false
        }
    ];
    const progress = ((currentStep + 1) / steps.length) * 100;
    const updateData = (field, value) => {
        setOnboardingData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
        else {
            // Completar onboarding
            const completedData = { ...onboardingData, completed: true };
            onComplete(completedData);
            toast({
                title: "¡Onboarding completado!",
                description: "Tu perfil ha sido configurado exitosamente",
                status: "success",
                duration: 4000,
            });
        }
    };
    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    const canProceed = () => {
        const step = steps[currentStep];
        if (!step.required)
            return true;
        switch (step.id) {
            case "personal":
                return onboardingData.personalInfo.name && onboardingData.personalInfo.age > 0;
            case "preferences":
                return onboardingData.preferences.reminderFrequency && onboardingData.preferences.sessionDuration;
            case "baseline":
                return onboardingData.baselinePhotos.length >= 3;
            default:
                return true;
        }
    };
    const renderStepContent = () => {
        const step = steps[currentStep];
        switch (step.id) {
            case "welcome":
                return (_jsxs(VStack, { spacing: 6, textAlign: "center", children: [_jsx(Image, { src: "https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=\uD83E\uDDE0", alt: "DoYouRemember Logo", boxSize: "150px", borderRadius: "full" }), _jsxs(VStack, { spacing: 4, children: [_jsx(Text, { fontSize: "2xl", fontWeight: "bold", color: "blue.500", children: "\u00A1Bienvenido a DoYouRemember!" }), _jsx(Text, { color: "gray.600", maxW: "md", children: "Te ayudaremos a configurar tu perfil y establecer tu l\u00EDnea base para monitorear tu memoria de manera efectiva." })] }), _jsxs(VStack, { spacing: 3, align: "start", maxW: "md", children: [_jsx(Text, { fontWeight: "bold", children: "\u00BFQu\u00E9 haremos?" }), _jsxs(VStack, { spacing: 2, align: "start", fontSize: "sm", color: "gray.600", children: [_jsx(Text, { children: "\u2022 Configurar tu informaci\u00F3n personal" }), _jsx(Text, { children: "\u2022 Establecer tus preferencias de recordatorios" }), _jsx(Text, { children: "\u2022 Crear tu l\u00EDnea base con fotos familiares" }), _jsx(Text, { children: "\u2022 Definir tus objetivos de seguimiento" })] })] })] }));
            case "personal":
                return (_jsxs(VStack, { spacing: 4, w: "full", children: [_jsx(Text, { fontSize: "sm", color: "gray.600", textAlign: "center", children: "Esta informaci\u00F3n nos ayudar\u00E1 a personalizar tu experiencia" }), _jsxs(FormControl, { isRequired: true, children: [_jsx(FormLabel, { children: "Nombre completo" }), _jsx(Input, { placeholder: "Tu nombre completo", value: onboardingData.personalInfo.name, onChange: (e) => updateData("personalInfo", {
                                        ...onboardingData.personalInfo,
                                        name: e.target.value
                                    }) })] }), _jsxs(FormControl, { isRequired: true, children: [_jsx(FormLabel, { children: "Edad" }), _jsx(Input, { type: "number", placeholder: "Tu edad", value: onboardingData.personalInfo.age || "", onChange: (e) => updateData("personalInfo", {
                                        ...onboardingData.personalInfo,
                                        age: parseInt(e.target.value) || 0
                                    }) })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { children: "Relaci\u00F3n con el cuidador" }), _jsxs(Select, { placeholder: "Selecciona una opci\u00F3n", value: onboardingData.personalInfo.relationship, onChange: (e) => updateData("personalInfo", {
                                        ...onboardingData.personalInfo,
                                        relationship: e.target.value
                                    }), children: [_jsx("option", { value: "self", children: "Yo mismo/a" }), _jsx("option", { value: "spouse", children: "C\u00F3nyuge" }), _jsx("option", { value: "parent", children: "Padre/Madre" }), _jsx("option", { value: "child", children: "Hijo/Hija" }), _jsx("option", { value: "sibling", children: "Hermano/Hermana" }), _jsx("option", { value: "other", children: "Otro" })] })] })] }));
            case "preferences":
                return (_jsxs(VStack, { spacing: 4, w: "full", children: [_jsx(Text, { fontSize: "sm", color: "gray.600", textAlign: "center", children: "Configura c\u00F3mo quieres recibir recordatorios" }), _jsxs(FormControl, { isRequired: true, children: [_jsx(FormLabel, { children: "Frecuencia de recordatorios" }), _jsxs(Select, { value: onboardingData.preferences.reminderFrequency, onChange: (e) => updateData("preferences", {
                                        ...onboardingData.preferences,
                                        reminderFrequency: e.target.value
                                    }), children: [_jsx("option", { value: "daily", children: "Diario" }), _jsx("option", { value: "every-other-day", children: "Cada dos d\u00EDas" }), _jsx("option", { value: "weekly", children: "Semanal" }), _jsx("option", { value: "custom", children: "Personalizado" })] })] }), _jsxs(FormControl, { isRequired: true, children: [_jsx(FormLabel, { children: "Duraci\u00F3n de sesi\u00F3n preferida" }), _jsxs(Select, { value: onboardingData.preferences.sessionDuration, onChange: (e) => updateData("preferences", {
                                        ...onboardingData.preferences,
                                        sessionDuration: e.target.value
                                    }), children: [_jsx("option", { value: "10", children: "10 minutos" }), _jsx("option", { value: "15", children: "15 minutos" }), _jsx("option", { value: "20", children: "20 minutos" }), _jsx("option", { value: "30", children: "30 minutos" })] })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { children: "Hora preferida" }), _jsxs(Select, { value: onboardingData.preferences.preferredTime, onChange: (e) => updateData("preferences", {
                                        ...onboardingData.preferences,
                                        preferredTime: e.target.value
                                    }), children: [_jsx("option", { value: "morning", children: "Ma\u00F1ana (8:00 - 12:00)" }), _jsx("option", { value: "afternoon", children: "Tarde (12:00 - 18:00)" }), _jsx("option", { value: "evening", children: "Noche (18:00 - 22:00)" }), _jsx("option", { value: "flexible", children: "Flexible" })] })] })] }));
            case "baseline":
                return (_jsxs(VStack, { spacing: 4, w: "full", children: [_jsxs(Alert, { status: "info", children: [_jsx(AlertIcon, {}), _jsx(Text, { fontSize: "sm", children: "Para establecer tu l\u00EDnea base, necesitamos al menos 3 fotos familiares. Estas servir\u00E1n como referencia para medir tu progreso." })] }), _jsxs(VStack, { spacing: 3, w: "full", children: [_jsx(Text, { fontWeight: "bold", children: "Fotos de l\u00EDnea base (m\u00EDnimo 3):" }), _jsx(HStack, { spacing: 2, flexWrap: "wrap", children: onboardingData.baselinePhotos.map((photo, index) => (_jsxs(Badge, { colorScheme: "green", p: 2, children: ["Foto ", index + 1, " \u2713"] }, index))) }), _jsx(Button, { colorScheme: "blue", variant: "outline", onClick: () => {
                                        if (onboardingData.baselinePhotos.length < 10) {
                                            updateData("baselinePhotos", [
                                                ...onboardingData.baselinePhotos,
                                                `baseline-photo-${onboardingData.baselinePhotos.length + 1}`
                                            ]);
                                        }
                                    }, isDisabled: onboardingData.baselinePhotos.length >= 10, children: "\uD83D\uDCF8 Agregar Foto de L\u00EDnea Base" }), onboardingData.baselinePhotos.length >= 3 && (_jsxs(Alert, { status: "success", children: [_jsx(AlertIcon, {}), _jsxs(Text, { fontSize: "sm", children: ["\u00A1Perfecto! Tienes ", onboardingData.baselinePhotos.length, " fotos para tu l\u00EDnea base."] })] }))] })] }));
            case "goals":
                return (_jsxs(VStack, { spacing: 4, w: "full", children: [_jsx(Text, { fontSize: "sm", color: "gray.600", textAlign: "center", children: "\u00BFQu\u00E9 te gustar\u00EDa lograr con DoYouRemember?" }), _jsx(CheckboxGroup, { value: onboardingData.goals, onChange: (values) => updateData("goals", values), children: _jsxs(Stack, { spacing: 3, children: [_jsx(Checkbox, { value: "memory-monitoring", children: "Monitorear mi memoria a largo plazo" }), _jsx(Checkbox, { value: "early-detection", children: "Detectar cambios tempranos en mi memoria" }), _jsx(Checkbox, { value: "family-connection", children: "Mantener conexi\u00F3n con recuerdos familiares" }), _jsx(Checkbox, { value: "peace-of-mind", children: "Tranquilidad para m\u00ED y mi familia" }), _jsx(Checkbox, { value: "medical-insights", children: "Proporcionar informaci\u00F3n \u00FAtil a mi m\u00E9dico" })] }) }), _jsxs(FormControl, { children: [_jsx(FormLabel, { children: "Descripci\u00F3n inicial (opcional)" }), _jsx(Textarea, { placeholder: "Cu\u00E9ntanos m\u00E1s sobre tus expectativas o preocupaciones...", value: onboardingData.initialDescription, onChange: (e) => updateData("initialDescription", e.target.value), rows: 3 })] })] }));
            default:
                return null;
        }
    };
    return (_jsxs(VStack, { spacing: 6, w: "full", children: [_jsxs(Box, { textAlign: "center", w: "full", children: [_jsx(Text, { fontSize: "2xl", fontWeight: "bold", mb: 2, children: steps[currentStep].title }), _jsx(Text, { color: "gray.600", mb: 4, children: steps[currentStep].description }), _jsx(Progress, { value: progress, w: "full", colorScheme: "blue", size: "lg" }), _jsxs(Text, { fontSize: "sm", color: "gray.500", mt: 2, children: ["Paso ", currentStep + 1, " de ", steps.length] })] }), _jsx(Card, { w: "full", children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 6, children: [_jsxs(HStack, { children: [steps[currentStep].icon, _jsxs(VStack, { align: "start", spacing: 1, children: [_jsx(Text, { fontSize: "lg", fontWeight: "bold", children: steps[currentStep].title }), steps[currentStep].required && (_jsx(Badge, { colorScheme: "red", size: "sm", children: "Requerido" }))] })] }), _jsx(Divider, {}), renderStepContent()] }) }) }), _jsxs(HStack, { spacing: 4, w: "full", justify: "space-between", children: [_jsx(Button, { leftIcon: _jsx(FaArrowLeft, {}), onClick: prevStep, isDisabled: currentStep === 0, variant: "outline", children: "Anterior" }), _jsx(Button, { onClick: onSkip, variant: "ghost", colorScheme: "gray", children: "Omitir por ahora" }), _jsx(Button, { rightIcon: currentStep === steps.length - 1 ? _jsx(FaCheck, {}) : _jsx(FaArrowRight, {}), onClick: nextStep, colorScheme: "blue", isDisabled: !canProceed(), children: currentStep === steps.length - 1 ? "Completar" : "Siguiente" })] })] }));
}
