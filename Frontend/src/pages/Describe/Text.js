import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Heading, Text, Flex, VStack, Card, CardBody, FormControl, FormLabel, Textarea, Input, Button, Alert, AlertIcon, useToast, } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { api } from "../../lib/api";
export default function DescribeText() {
    const { user } = useAuth();
    const toast = useToast();
    const canDescribe = !!user && hasPermission(user.role, "describe_photos");
    const [form, setForm] = useState({
        photoId: "",
        title: "",
        description: "",
    });
    const [saving, setSaving] = useState(false);
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.photoId || !form.description) {
            toast({ title: "Completa los campos requeridos", status: "warning" });
            return;
        }
        try {
            setSaving(true);
            const patientId = user?.linkedPatientIds?.[0] || user?.uid || "demo-patient";
            await api.post("/descriptions/text", {
                patientId,
                photoId: form.photoId,
                title: form.title || "Descripción",
                description: form.description,
            });
            toast({ title: "Descripción guardada", status: "success" });
            setForm({ photoId: "", title: "", description: "" });
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error("save text description", err);
            toast({
                title: "No se pudo guardar",
                description: err?.response?.data?.error || err?.message || "Intenta nuevamente",
                status: "error",
            });
        }
        finally {
            setSaving(false);
        }
    };
    if (!canDescribe) {
        return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(Alert, { status: "warning", children: [_jsx(AlertIcon, {}), "No tienes permisos para describir fotos por texto con tu rol actual."] }) })] })] }));
    }
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { align: "stretch", spacing: 6, children: [_jsxs(Box, { children: [_jsx(Heading, { color: "whiteAlpha.900", mb: 2, children: "Describir por Texto" }), _jsx(Text, { color: "blue.600", children: "Escribe una descripci\u00F3n detallada para una foto espec\u00EDfica." })] }), _jsx(Card, { children: _jsx(CardBody, { as: "form", onSubmit: onSubmit, children: _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsxs(FormControl, { isRequired: true, children: [_jsx(FormLabel, { children: "ID de la foto" }), _jsx(Input, { placeholder: "Ej: photo-abc123", value: form.photoId, onChange: (e) => setForm((s) => ({ ...s, photoId: e.target.value })) })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { children: "T\u00EDtulo (opcional)" }), _jsx(Input, { placeholder: "Ej: Cumplea\u00F1os de mam\u00E1", value: form.title, onChange: (e) => setForm((s) => ({ ...s, title: e.target.value })) })] }), _jsxs(FormControl, { isRequired: true, children: [_jsx(FormLabel, { children: "Descripci\u00F3n" }), _jsx(Textarea, { rows: 6, placeholder: "\u00BFQui\u00E9n aparece? \u00BFD\u00F3nde est\u00E1n? \u00BFQu\u00E9 sucede? \u00BFQu\u00E9 recuerdas o sientes al verla?", value: form.description, onChange: (e) => setForm((s) => ({ ...s, description: e.target.value })) })] }), _jsx(Button, { type: "submit", colorScheme: "blue", isLoading: saving, children: "Guardar descripci\u00F3n" })] }) }) })] }) })] })] }));
}
