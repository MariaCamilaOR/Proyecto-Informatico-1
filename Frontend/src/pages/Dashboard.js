import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Heading, Text, Grid, GridItem, Card, CardBody, Flex, Badge, VStack, HStack, Button } from "@chakra-ui/react";
import { Navbar } from "../components/Layout/Navbar";
import { Sidebar } from "../components/Layout/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { normalizeRole } from "../lib/roles";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
export default function Dashboard() {
    const { user } = useAuth();
    const role = normalizeRole(user?.role);
    const nav = useNavigate();
    const [photoCount, setPhotoCount] = useState(null);
    const [lastUploaded, setLastUploaded] = useState(null);
    useEffect(() => {
        const load = async () => {
            if (!user)
                return;
            const patientId = user.linkedPatientIds?.[0] || "demo-patient-123";
            try {
                const resp = await api.get(`/photos/patient/${patientId}`);
                const items = resp.data || [];
                setPhotoCount(items.length);
                if (items.length > 0) {
                    // items returned with createdAt ISO strings — find latest
                    const dates = items.map((it) => (it.createdAt ? new Date(it.createdAt) : null)).filter(Boolean);
                    if (dates.length > 0) {
                        const latest = new Date(Math.max(...dates.map((d) => d.getTime())));
                        setLastUploaded(latest.toLocaleString());
                    }
                    else {
                        setLastUploaded(null);
                    }
                }
                else {
                    setLastUploaded(null);
                }
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.error("Failed to load photos for dashboard", e);
                setPhotoCount(null);
                setLastUploaded(null);
            }
        };
        load();
        // reload when user changes
    }, [user?.uid]);
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { align: "stretch", spacing: 6, children: [_jsxs(Box, { children: [_jsx(Heading, { mb: 2, children: "Dashboard" }), _jsx(Text, { color: "blue.600", children: "Bienvenido al prototipo de DoYouRemember" })] }), _jsxs(Grid, { templateColumns: "repeat(3, 1fr)", gap: 6, children: [_jsx(GridItem, { children: _jsx(Card, { children: _jsxs(CardBody, { children: [_jsxs(HStack, { justify: "space-between", mb: 2, children: [_jsx(Heading, { size: "sm", children: "\uD83D\uDCF8 Fotos Subidas" }), _jsx(Badge, { colorScheme: "blue", children: "Cuenta" })] }), _jsx(Text, { fontSize: "2xl", fontWeight: "bold", color: "blue.500", children: photoCount === null ? '—' : photoCount }), _jsxs(Text, { fontSize: "sm", color: "blue.500", children: ["\u00DAltima: ", lastUploaded || 'Nunca'] })] }) }) }), _jsx(GridItem, { children: _jsx(Card, { children: _jsxs(CardBody, { children: [_jsxs(HStack, { justify: "space-between", mb: 2, children: [_jsx(Heading, { size: "sm", children: "\uD83C\uDFAF Sesiones Completadas" }), _jsx(Badge, { colorScheme: "green", children: "Demo" })] }), _jsx(Text, { fontSize: "2xl", fontWeight: "bold", color: "green.500", children: "8" }), _jsx(Text, { fontSize: "sm", color: "blue.500", children: "Promedio: 85%" })] }) }) }), _jsx(GridItem, { children: _jsx(Card, { children: _jsxs(CardBody, { children: [_jsxs(HStack, { justify: "space-between", mb: 2, children: [_jsx(Heading, { size: "sm", children: "\uD83D\uDCCA Reportes Generados" }), _jsx(Badge, { colorScheme: "purple", children: "Demo" })] }), _jsx(Text, { fontSize: "2xl", fontWeight: "bold", color: "purple.500", children: "3" }), _jsx(Text, { fontSize: "sm", color: "blue.500", children: "\u00DAltimo: ayer" })] }) }) })] }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx(Heading, { size: "md", mb: 4, children: "\uD83D\uDE80 Acciones r\u00E1pidas" }), _jsxs(HStack, { spacing: 3, wrap: "wrap", children: [role === "PATIENT" && (_jsxs(_Fragment, { children: [_jsx(Button, { onClick: () => nav("/patient/caretaker"), colorScheme: "teal", children: "Mi cuidador" }), _jsx(Button, { onClick: () => nav("/describe/wizard"), variant: "outline", children: "Describir (Wizard)" }), _jsx(Button, { onClick: () => nav("/reminders"), variant: "ghost", children: "Recordatorios" })] })), role === "CAREGIVER" && (_jsxs(_Fragment, { children: [_jsx(Button, { onClick: () => nav("/photos"), colorScheme: "blue", children: "Fotos del paciente" }), _jsx(Button, { onClick: () => nav("/cuidador/photos/upload"), colorScheme: "blue", children: "Subir fotos" }), _jsx(Button, { onClick: () => nav("/caregivers/patients"), variant: "outline", children: "Mis Pacientes" }), _jsx(Button, { onClick: () => nav("/alerts"), variant: "ghost", children: "Alertas" })] })), role === "DOCTOR" && (_jsxs(_Fragment, { children: [_jsx(Button, { onClick: () => nav("/reports"), colorScheme: "blue", children: "Ver reportes" }), _jsx(Button, { onClick: () => nav("/alerts"), variant: "outline", children: "Pol\u00EDticas de alertas" })] }))] })] }) })] }) })] })] }));
}
