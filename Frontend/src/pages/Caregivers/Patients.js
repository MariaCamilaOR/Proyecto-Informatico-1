import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Heading, Text, Flex, VStack, Card, CardBody, HStack, Badge, Button, Avatar, Alert, AlertIcon, } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useToast } from "@chakra-ui/react";
export default function CaregiversPatients() {
    const { user } = useAuth();
    const canViewPatients = user && hasPermission(user.role, "view_patient_reports");
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const loadPatients = async () => {
        setLoading(true);
        try {
            const resp = await api.get(`/patients`);
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
    useEffect(() => {
        if (canViewPatients)
            loadPatients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid]);
    if (!canViewPatients) {
        return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(Alert, { status: "warning", children: [_jsx(AlertIcon, {}), "No tienes permisos para ver pacientes con tu rol actual."] }) })] })] }));
    }
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Heading, { mb: 2, children: user?.role === "DOCTOR" ? "👩‍⚕️ Todos los Pacientes" : "👥 Mis Pacientes" }), _jsx(Text, { color: "blue.600", children: user?.role === "DOCTOR"
                                                ? "Pacientes bajo tu supervisión médica"
                                                : "Pacientes vinculados a tu cuenta de cuidador" })] }), patients.length === 0 ? (_jsx(Card, { children: _jsx(CardBody, { children: _jsxs(Alert, { status: "info", children: [_jsx(AlertIcon, {}), user?.role === "DOCTOR"
                                                    ? "No hay pacientes registrados en el sistema aún."
                                                    : "No hay pacientes disponibles."] }) }) })) : (_jsx(VStack, { spacing: 4, align: "stretch", children: patients.map((patient) => (_jsx(Card, { children: _jsx(CardBody, { children: _jsxs(HStack, { justify: "space-between", align: "start", children: [_jsxs(HStack, { spacing: 4, children: [_jsx(Avatar, { name: patient.displayName || patient.id, src: undefined, size: "lg" }), _jsxs(VStack, { align: "start", spacing: 1, children: [_jsx(Heading, { size: "md", children: patient.displayName || patient.id }), _jsx(Text, { color: "blue.600", fontSize: "sm", children: patient.email || "—" }), _jsx(HStack, { spacing: 4, children: _jsx(Badge, { colorScheme: patient.assignedCaregiverId ? "gray" : "green", children: patient.assignedCaregiverId ? "Asignado" : "Disponible" }) })] })] }), _jsx(VStack, { spacing: 2, align: "end", children: _jsx(HStack, { spacing: 2, children: patient.assignedCaregiverId ? (patient.assignedCaregiverId === user?.uid ? (_jsx(Button, { size: "sm", colorScheme: "gray", isDisabled: true, children: "Asignado a ti" })) : (_jsx(Button, { size: "sm", colorScheme: "gray", isDisabled: true, children: "Asignado a otro" }))) : (_jsx(Button, { size: "sm", colorScheme: "green", onClick: async () => {
                                                                    try {
                                                                        await api.post(`/patients/${patient.id}/assign`);
                                                                        toast({ title: "Asignado", description: "Te has asignado como cuidador.", status: "success", duration: 3000 });
                                                                        await loadPatients();
                                                                    }
                                                                    catch (err) {
                                                                        console.error("Assign failed", err);
                                                                        if (err?.response?.status === 409) {
                                                                            toast({ title: "No disponible", description: "El paciente ya está asignado.", status: "warning", duration: 4000 });
                                                                        }
                                                                        else {
                                                                            toast({ title: "Error", description: "No se pudo asignar al paciente.", status: "error", duration: 4000 });
                                                                        }
                                                                    }
                                                                }, children: "Asignarme" })) }) })] }) }) }, patient.id))) })), _jsx(Box, { p: 4, bg: "green.50", borderRadius: "md", children: _jsxs(VStack, { spacing: 3, align: "start", children: [_jsx(Text, { fontWeight: "bold", children: user?.role === "DOCTOR" ? "💡 Como médico puedes:" : "💡 Como cuidador puedes:" }), _jsx(VStack, { align: "start", spacing: 1, fontSize: "sm", color: "blue.600", children: user?.role === "DOCTOR" ? (_jsxs(_Fragment, { children: [_jsx(Text, { children: "\u2022 Ver el progreso y reportes de todos los pacientes" }), _jsx(Text, { children: "\u2022 Generar reportes detallados y an\u00E1lisis" }), _jsx(Text, { children: "\u2022 Configurar pol\u00EDticas de alertas globales" }), _jsx(Text, { children: "\u2022 Exportar datos para an\u00E1lisis m\u00E9dico" })] })) : (_jsxs(_Fragment, { children: [_jsx(Text, { children: "\u2022 Ver el progreso y reportes de tus pacientes" }), _jsx(Text, { children: "\u2022 Subir fotos en nombre del paciente" }), _jsx(Text, { children: "\u2022 Configurar recordatorios para sesiones" }), _jsx(Text, { children: "\u2022 Recibir alertas sobre cambios importantes" })] })) })] }) })] }) })] })] }));
}
