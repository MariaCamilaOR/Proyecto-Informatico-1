import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Heading, Text, Flex, VStack, Card, CardBody, HStack, Badge, Button, Avatar, Alert, AlertIcon, } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useToast } from "@chakra-ui/react";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/react";
export default function CaregiversPatients() {
    const { user } = useAuth();
    const canViewPatients = user && hasPermission(user.role, "view_patient_reports");
    const [patients, setPatients] = useState([]);
    const [linkedPatients, setLinkedPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const loadPatients = async (email) => {
        setLoading(true);
        try {
            const url = email ? `/patients?email=${encodeURIComponent(email)}` : `/patients`;
            const resp = await api.get(url);
            setPatients(resp.data || []);
        }
        catch (e) {
            console.error("Failed to load patients", e);
            toast({ title: "Error", description: "No se pudieron cargar los pacientes.", status: "error", duration: 4000 });
        }
        finally {
            setLoading(false);
        }
    };
    const loadLinkedPatients = async () => {
        if (!user)
            return;
        try {
            const ids = user.linkedPatientIds || [];
            const list = [];
            for (const id of ids) {
                try {
                    const resp = await api.get(`/patients/${id}`);
                    list.push(resp.data);
                }
                catch (err) {
                    // skip missing
                }
            }
            setLinkedPatients(list);
        }
        catch (e) {
            console.error("Failed to load linked patients", e);
        }
    };
    const [inviteCodeInput, setInviteCodeInput] = useState("");
    const onAddByCode = async () => {
        const code = inviteCodeInput.trim();
        if (!code)
            return toast({ title: "Ingrese un código", status: "warning", duration: 2000 });
        try {
            await api.post(`/patients/assign-by-code`, { code });
            toast({ title: "Asignado", description: "Paciente agregado a tu lista.", status: "success", duration: 3000 });
            setInviteCodeInput("");
            await loadLinkedPatients();
        }
        catch (err) {
            console.error("Assign by code failed", err);
            const status = err?.response?.status;
            if (status === 404)
                toast({ title: "No encontrado", description: "Código inválido.", status: "error", duration: 4000 });
            else if (status === 409)
                toast({ title: "No disponible", description: "El paciente ya está asignado a otro cuidador.", status: "warning", duration: 4000 });
            else
                toast({ title: "Error", description: "No se pudo asignar por código.", status: "error", duration: 4000 });
        }
    };
    useEffect(() => {
        if (canViewPatients) {
            loadPatients();
            loadLinkedPatients();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid]);
    if (!canViewPatients) {
        return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(Alert, { status: "warning", children: [_jsx(AlertIcon, {}), "No tienes permisos para ver pacientes con tu rol actual."] }) })] })] }));
    }
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Heading, { mb: 2, children: user?.role === "DOCTOR" ? "👩‍⚕️ Todos los Pacientes" : "👥 Mis Pacientes" }), _jsx(Text, { color: "blue.600", children: user?.role === "DOCTOR"
                                                ? "Pacientes bajo tu supervisión médica"
                                                : "Pacientes vinculados a tu cuenta de cuidador" })] }), _jsx(Box, { children: _jsxs(InputGroup, { maxW: "lg", children: [_jsx(Input, { placeholder: "Pegar c\u00F3digo de invitaci\u00F3n...", value: inviteCodeInput, onChange: (e) => setInviteCodeInput(e.target.value) }), _jsx(InputRightElement, { width: "6.5rem", children: _jsx(Button, { h: "1.75rem", size: "sm", onClick: onAddByCode, children: "Agregar" }) })] }) }), linkedPatients.length === 0 ? (_jsx(Card, { children: _jsx(CardBody, { children: _jsxs(Alert, { status: "info", children: [_jsx(AlertIcon, {}), user?.role === "DOCTOR"
                                                    ? "No tienes pacientes enlazados aún."
                                                    : "No tienes pacientes añadidos. Pega el código de invitación del paciente para añadirlo."] }) }) })) : (_jsx(VStack, { spacing: 4, align: "stretch", children: linkedPatients.map((patient) => (_jsx(Card, { children: _jsx(CardBody, { children: _jsxs(HStack, { justify: "space-between", align: "start", children: [_jsxs(HStack, { spacing: 4, children: [_jsx(Avatar, { name: patient.displayName || patient.id, src: undefined, size: "lg" }), _jsxs(VStack, { align: "start", spacing: 1, children: [_jsx(Heading, { size: "md", children: patient.displayName || patient.id }), _jsx(Text, { color: "blue.600", fontSize: "sm", children: patient.email || "—" }), _jsx(HStack, { spacing: 4, children: _jsx(Badge, { colorScheme: patient.assignedCaregiverId ? "gray" : "green", children: patient.assignedCaregiverId ? "Asignado" : "Disponible" }) })] })] }), _jsx(VStack, { spacing: 2, align: "end", children: _jsx(HStack, { spacing: 2, children: patient.assignedCaregiverId === user?.uid ? (_jsx(Button, { size: "sm", colorScheme: "red", onClick: async () => {
                                                                    try {
                                                                        await api.post(`/patients/${patient.id}/unassign`);
                                                                        toast({ title: "Desasignado", description: "Ya no eres el cuidador de este paciente.", status: "success", duration: 3000 });
                                                                        await loadLinkedPatients();
                                                                    }
                                                                    catch (err) {
                                                                        console.error("Unassign failed", err);
                                                                        toast({ title: "Error", description: "No se pudo desasignar al paciente.", status: "error", duration: 4000 });
                                                                    }
                                                                }, children: "Desasignarme" })) : (_jsx(Button, { size: "sm", colorScheme: "gray", isDisabled: true, children: "Asignado a otro" })) }) })] }) }) }, patient.id))) })), _jsx(Box, { p: 4, bg: "green.50", borderRadius: "md", children: _jsxs(VStack, { spacing: 3, align: "start", children: [_jsx(Text, { fontWeight: "bold", children: user?.role === "DOCTOR" ? "💡 Como médico puedes:" : "💡 Como cuidador puedes:" }), _jsx(VStack, { align: "start", spacing: 1, fontSize: "sm", color: "blue.600", children: user?.role === "DOCTOR" ? (_jsxs(_Fragment, { children: [_jsx(Text, { children: "\u2022 Ver el progreso y reportes de todos los pacientes" }), _jsx(Text, { children: "\u2022 Generar reportes detallados y an\u00E1lisis" }), _jsx(Text, { children: "\u2022 Configurar pol\u00EDticas de alertas globales" }), _jsx(Text, { children: "\u2022 Exportar datos para an\u00E1lisis m\u00E9dico" })] })) : (_jsxs(_Fragment, { children: [_jsx(Text, { children: "\u2022 Ver el progreso y reportes de tus pacientes" }), _jsx(Text, { children: "\u2022 Subir fotos en nombre del paciente" }), _jsx(Text, { children: "\u2022 Configurar recordatorios para sesiones" }), _jsx(Text, { children: "\u2022 Recibir alertas sobre cambios importantes" })] })) })] }) })] }) })] })] }));
}
