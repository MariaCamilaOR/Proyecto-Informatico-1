import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { Box, Heading, Text, VStack, Card, CardBody, HStack, Avatar, Button, Checkbox, Textarea, useToast, Divider } from "@chakra-ui/react";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
export default function PatientDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [patient, setPatient] = useState(null);
    const [descriptions, setDescriptions] = useState([]);
    const [reports, setReports] = useState([]);
    const [selected, setSelected] = useState({});
    const [baseline, setBaseline] = useState("");
    const [message, setMessage] = useState("");
    const toast = useToast();
    const load = async () => {
        if (!id)
            return;
        try {
            const p = await api.get(`/patients/${id}`);
            setPatient(p.data);
        }
        catch (e) {
            console.error("Failed to load patient", e);
        }
        try {
            const d = await api.get(`/descriptions/patient/${id}`);
            setDescriptions(d.data || []);
        }
        catch (e) {
            console.error("Failed to load descriptions", e);
        }
        try {
            const r = await api.get(`/reports/patient/${id}`);
            setReports(r.data || []);
        }
        catch (e) {
            console.error("Failed to load reports", e);
        }
    };
    useEffect(() => { load(); }, [id]);
    const toggle = (descId) => setSelected((s) => ({ ...s, [descId]: !s[descId] }));
    const handleCreateReport = async () => {
        if (!id)
            return;
        // gather selected descriptions
        const selectedList = descriptions.filter((d) => selected[d.id]);
        if (selectedList.length === 0 && !baseline) {
            toast({ title: "Nada seleccionado", description: "Selecciona al menos una descripción o escribe una línea base.", status: "warning" });
            return;
        }
        try {
            const payload = { patientId: id, data: { descriptions: selectedList, createdBy: user?.uid }, baseline };
            await api.post(`/reports`, payload);
            toast({ title: "Reporte creado", status: "success" });
            // refresh reports
            const r = await api.get(`/reports/patient/${id}`);
            setReports(r.data || []);
        }
        catch (e) {
            console.error("Failed to create report", e);
            toast({ title: "Error", description: "No se pudo crear el reporte.", status: "error" });
        }
    };
    const handleRequestBaseline = async () => {
        if (!id)
            return;
        try {
            await api.post(`/notifications`, { patientId: id, type: "baseline_request", message });
            toast({ title: "Solicitud enviada", description: "Se solicitó al paciente que establezca una línea base.", status: "success" });
            setMessage("");
        }
        catch (e) {
            console.error("Failed to send notification", e);
            toast({ title: "Error", description: "No se pudo enviar la solicitud.", status: "error" });
        }
    };
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(HStack, { spacing: 0, align: "stretch", children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { align: "stretch", spacing: 6, children: [_jsxs(Heading, { children: ["Paciente: ", patient?.displayName || patient?.email || id] }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx(Heading, { size: "sm", children: "Descripciones del paciente" }), _jsx(Text, { fontSize: "sm", color: "gray.600", children: "Selecciona las descripciones que quieras incluir en un reporte." }), _jsx(VStack, { align: "stretch", mt: 3, children: descriptions.length === 0 ? _jsx(Text, { children: "No hay descripciones." }) : descriptions.map((d) => (_jsx(Card, { children: _jsx(CardBody, { children: _jsxs(HStack, { align: "start", justify: "space-between", children: [_jsxs(HStack, { children: [_jsx(Avatar, { name: d.authorUid || 'Paciente', size: "sm" }), _jsxs(Box, { children: [_jsx(Text, { fontWeight: "bold", children: d.type || 'descripcion' }), _jsx(Text, { fontSize: "sm", children: d.type === 'text' ? d.description : JSON.stringify(d.data) })] })] }), _jsx(Checkbox, { isChecked: !!selected[d.id], onChange: () => toggle(d.id), children: "Incluir" })] }) }) }, d.id))) }), _jsx(Divider, { my: 4 }), _jsx(Heading, { size: "sm", children: "Crear Reporte" }), _jsx(Text, { fontSize: "sm", color: "gray.600", children: "Puedes incluir las descripciones seleccionadas y/o una l\u00EDnea base." }), _jsx(Textarea, { mt: 2, placeholder: "L\u00EDnea base (opcional)", value: baseline, onChange: (e) => setBaseline(e.target.value) }), _jsx(HStack, { justify: "flex-end", mt: 3, children: _jsx(Button, { colorScheme: "green", onClick: handleCreateReport, children: "Crear Reporte" }) })] }) }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx(Heading, { size: "sm", children: "Solicitar L\u00EDnea Base" }), _jsx(Text, { fontSize: "sm", color: "gray.600", children: "Env\u00EDa una solicitud al paciente para que complete una l\u00EDnea base que puedas usar en futuros reportes." }), _jsx(Textarea, { mt: 2, placeholder: "Mensaje al paciente (opcional)", value: message, onChange: (e) => setMessage(e.target.value) }), _jsx(HStack, { justify: "flex-end", mt: 3, children: _jsx(Button, { colorScheme: "blue", onClick: handleRequestBaseline, children: "Solicitar L\u00EDnea Base" }) })] }) }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx(Heading, { size: "sm", children: "Reportes previos" }), reports.length === 0 ? _jsx(Text, { children: "No hay reportes." }) : (_jsx(VStack, { align: "stretch", children: reports.map((r) => (_jsx(Card, { children: _jsxs(CardBody, { children: [_jsx(Text, { fontWeight: "bold", children: new Date(r.createdAt?.toDate ? r.createdAt.toDate() : r.createdAt).toLocaleString() }), _jsx(Text, { fontSize: "sm", children: JSON.stringify(r.data) })] }) }, r.id))) }))] }) })] }) })] })] }));
}
