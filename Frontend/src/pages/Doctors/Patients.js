import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Heading, Text, Flex, VStack, Card, CardBody, HStack, Button, Avatar, Alert, AlertIcon, Grid, GridItem, Input, InputGroup, InputRightElement, } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { useEffect, useState, useRef } from "react";
import { api } from "../../api";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
export default function DoctorsPatients() {
    const { user } = useAuth();
    const canViewPatients = user && hasPermission(user.role, "view_patient_reports");
    const [patients, setPatients] = useState([]);
    const [linkedPatients, setLinkedPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const nav = useNavigate();
    const loadPatients = async (q) => {
        setLoading(true);
        try {
            const url = q ? `/patients?q=${encodeURIComponent(q)}` : `/patients`;
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
                    // avoid accidentally including the doctor himself if present
                    if (resp.data && resp.data.id !== user.uid)
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
    useEffect(() => {
        if (canViewPatients) {
            loadPatients();
            loadLinkedPatients();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid]);
    // Debounce search: trigger loadPatients 500ms after user stops typing
    const searchTimeoutRef = useRef(null);
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = null;
        }
        const q = searchQuery.trim();
        if (!q) {
            // empty query -> load full list immediately
            loadPatients();
            return;
        }
        searchTimeoutRef.current = setTimeout(() => {
            loadPatients(q);
        }, 500);
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
                searchTimeoutRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);
    // Polling for live updates every 10 seconds
    const pollIntervalRef = useRef(null);
    useEffect(() => {
        if (!canViewPatients)
            return;
        // start polling
        pollIntervalRef.current = setInterval(() => {
            loadPatients(searchQuery.trim() || undefined);
            loadLinkedPatients();
        }, 10000);
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canViewPatients, user?.uid]);
    if (!canViewPatients) {
        return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(Alert, { status: "warning", children: [_jsx(AlertIcon, {}), "No tienes permisos para ver pacientes con tu rol actual."] }) })] })] }));
    }
    const handleAssign = async (patientId) => {
        try {
            await api.post(`/patients/${patientId}/assign-doctor`);
            toast({ title: "Asignado", description: "Paciente asignado a tu lista.", status: "success", duration: 3000 });
            await loadPatients();
            await loadLinkedPatients();
        }
        catch (err) {
            console.error("Assign doctor failed", err);
            const status = err?.response?.status;
            if (status === 409)
                toast({ title: "No disponible", description: "El paciente ya está asignado a otro doctor.", status: "warning", duration: 4000 });
            else
                toast({ title: "Error", description: "No se pudo asignar al paciente.", status: "error", duration: 4000 });
        }
    };
    const handleUnassign = async (patientId) => {
        try {
            await api.post(`/patients/${patientId}/unassign-doctor`);
            toast({ title: "Desasignado", description: "Paciente removido de tu lista.", status: "success", duration: 3000 });
            await loadPatients();
            await loadLinkedPatients();
        }
        catch (err) {
            console.error("Unassign doctor failed", err);
            toast({ title: "Error", description: "No se pudo desasignar al paciente.", status: "error", duration: 4000 });
        }
    };
    const doctorName = user?.displayName || user?.email || "usted";
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Heading, { mb: 2, children: "\uD83D\uDC68\u200D\u2695\uFE0F Pacientes" }), _jsx(Text, { color: "blue.600", children: "Listado de pacientes registrados. Selecciona los pacientes que quieras tomar a tu cargo." })] }), _jsx(Box, { children: _jsxs(InputGroup, { maxW: "lg", children: [_jsx(Input, { placeholder: "Buscar pacientes por email (parcial, no sensible a may\u00FAsculas)...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) }), _jsx(InputRightElement, { width: "6.5rem", children: _jsx(Button, { h: "1.75rem", size: "sm", onClick: async () => { await loadPatients(searchQuery.trim() || undefined); }, children: "Buscar" }) })] }) }), _jsxs(Grid, { templateColumns: { base: "1fr", md: "1fr 1fr" }, gap: 6, children: [_jsx(GridItem, { children: _jsx(Card, { children: _jsxs(CardBody, { children: [_jsxs(Heading, { size: "sm", mb: 3, children: ["Pacientes asignados a ", doctorName] }), linkedPatients.length === 0 ? (_jsx(Text, { children: "No tienes pacientes asignados a\u00FAn." })) : (_jsx(VStack, { spacing: 3, align: "stretch", children: linkedPatients.map((p) => (_jsx(Card, { children: _jsx(CardBody, { children: _jsxs(HStack, { justify: "space-between", children: [_jsxs(HStack, { children: [_jsx(Avatar, { name: p.displayName || p.id }), _jsxs(Box, { children: [_jsx(Text, { fontWeight: "bold", children: p.displayName || p.id }), _jsx(Text, { fontSize: "sm", color: "blue.600", children: p.email || '—' })] })] }), _jsxs(HStack, { children: [_jsx(Button, { size: "sm", onClick: () => nav(`/doctors/patient/${p.id}`), children: "Ver" }), _jsx(Button, { size: "sm", colorScheme: "red", onClick: () => handleUnassign(p.id), children: "Desasignarme" })] })] }) }) }, p.id))) }))] }) }) }), _jsx(GridItem, { children: _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx(Heading, { size: "sm", mb: 3, children: "Todos los pacientes" }), patients.length === 0 ? (_jsx(Text, { children: "No hay pacientes registrados." })) : (_jsx(VStack, { spacing: 3, align: "stretch", children: patients.map((patient) => (_jsx(Card, { children: _jsx(CardBody, { children: _jsxs(HStack, { justify: "space-between", children: [_jsxs(HStack, { children: [_jsx(Avatar, { name: patient.displayName || patient.id }), _jsxs(Box, { children: [_jsx(Text, { fontWeight: "bold", children: patient.displayName || patient.id }), _jsx(Text, { fontSize: "sm", color: "blue.600", children: patient.email || '—' })] })] }), _jsxs(HStack, { children: [_jsx(Button, { size: "sm", onClick: () => nav(`/doctors/patient/${patient.id}`), children: "Ver" }), patient.assignedDoctorId ? (patient.assignedDoctorId === user?.uid ? (_jsx(Button, { size: "sm", colorScheme: "red", onClick: () => handleUnassign(patient.id), children: "Desasignarme" })) : (_jsx(Button, { size: "sm", colorScheme: "gray", isDisabled: true, children: "Asignado a otro" }))) : (_jsx(Button, { size: "sm", colorScheme: "green", onClick: () => handleAssign(patient.id), children: "Asignarme" }))] })] }) }) }, patient.id))) }))] }) }) })] })] }) })] })] }));
}
