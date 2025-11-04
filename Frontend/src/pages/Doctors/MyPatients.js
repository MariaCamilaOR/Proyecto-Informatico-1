import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Box, Heading, Text, VStack, Card, CardBody, HStack, Button, Avatar, Input, InputGroup, InputRightElement, Grid } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
export default function MyPatients() {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const nav = useNavigate();
    const loadMyPatients = async (q) => {
        setLoading(true);
        try {
            const url = q ? `/patients?q=${encodeURIComponent(q)}` : `/patients`;
            const resp = await api.get(url);
            const all = resp.data || [];
            const mine = all.filter((p) => p.assignedDoctorId === user?.uid);
            setPatients(mine);
        }
        catch (e) {
            console.error("Failed to load my patients", e);
            toast({ title: "Error", description: "No se pudieron cargar tus pacientes.", status: "error", duration: 4000 });
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!user)
            return;
        loadMyPatients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid]);
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Grid, { templateColumns: { base: "1fr" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Heading, { children: "\uD83D\uDC68\u200D\u2695\uFE0F Mis Pacientes" }), _jsx(Text, { color: "gray.600", children: "Aqu\u00ED ver\u00E1s los pacientes que tienes asignados. Puedes buscarlos por nombre o email." })] }), _jsx(Box, { children: _jsxs(InputGroup, { maxW: "lg", children: [_jsx(Input, { placeholder: "Buscar por nombre o email...", value: query, onChange: (e) => setQuery(e.target.value) }), _jsx(InputRightElement, { width: "6.5rem", children: _jsx(Button, { h: "1.75rem", size: "sm", onClick: async () => await loadMyPatients(query.trim() || undefined), children: "Buscar" }) })] }) }), _jsx(Box, { children: patients.length === 0 ? (_jsx(Text, { children: "No hay pacientes asignados." })) : (_jsx(VStack, { spacing: 3, align: "stretch", children: patients.map((p) => (_jsx(Card, { children: _jsx(CardBody, { children: _jsxs(HStack, { justify: "space-between", children: [_jsxs(HStack, { children: [_jsx(Avatar, { name: p.displayName || p.id }), _jsxs(Box, { children: [_jsx(Text, { fontWeight: "bold", children: p.displayName || p.id }), _jsx(Text, { fontSize: "sm", color: "blue.600", children: p.email || '—' })] })] }), _jsx(HStack, { children: _jsx(Button, { size: "sm", colorScheme: "blue", onClick: () => nav(`/doctors/patient/${p.id}`), children: "Ver Descripciones" }) })] }) }) }, p.id))) })) })] }) })] })] }));
}
