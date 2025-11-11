import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Heading, Text, Flex, Card, CardBody, VStack, Avatar, Button, Spinner } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { api } from "../../api";
export default function PatientCaretaker() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [caregiver, setCaregiver] = useState(null);
    const [patientData, setPatientData] = useState(null);
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                if (!user)
                    return;
                const patientId = user.linkedPatientIds?.[0] || user.uid;
                const pResp = await api.get(`/patients/${patientId}`);
                const p = pResp.data;
                setPatientData(p);
                const caregiverId = p?.assignedCaregiverId || null;
                if (caregiverId) {
                    const cResp = await api.get(`/users/${caregiverId}`);
                    setCaregiver(cResp.data);
                }
                else {
                    setCaregiver(null);
                }
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.warn("Failed to load caregiver info", e);
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, [user?.uid]);
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { align: "stretch", spacing: 6, children: [_jsxs(Box, { children: [_jsx(Heading, { mb: 2, children: "Mi cuidador" }), _jsx(Text, { color: "blue.600", children: "Aqu\u00ED ver\u00E1s la informaci\u00F3n de la persona asignada como tu cuidador." })] }), loading ? (_jsx(Card, { children: _jsx(CardBody, { children: _jsx(Spinner, {}) }) })) : (_jsx(_Fragment, { children: !caregiver ? (_jsx(Card, { children: _jsxs(CardBody, { children: [_jsx(Text, { children: "No tienes un cuidador asignado a\u00FAn. Pide a tu cuidador que use tu c\u00F3digo de invitaci\u00F3n para agregarte." }), _jsxs(Text, { mt: 2, fontSize: "sm", color: "gray.600", children: ["Tu c\u00F3digo: ", _jsx(Box, { as: "span", fontFamily: "mono", children: user?.inviteCode || user?.uid })] })] }) })) : (_jsx(Card, { children: _jsx(CardBody, { children: _jsxs(VStack, { align: "start", spacing: 3, children: [_jsx(Avatar, { name: caregiver.displayName || caregiver.id, size: "lg" }), _jsx(Heading, { size: "md", children: caregiver.displayName || caregiver.id }), _jsx(Text, { color: "blue.600", children: caregiver.email || "—" }), _jsxs(Text, { fontSize: "sm", color: "gray.600", children: ["ID: ", caregiver.id] }), _jsx(Button, { onClick: () => window.location.href = `mailto:${caregiver.email}`, colorScheme: "blue", children: "Contactar" })] }) }) })) }))] }) })] })] }));
}
