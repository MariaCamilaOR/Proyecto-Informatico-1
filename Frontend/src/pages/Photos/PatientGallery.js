import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Flex, VStack, Heading, Text, Select } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { PhotoGallery } from "../../components/PhotoGallery/PhotoGallery";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
export default function PatientGallery() {
    const { user } = useAuth();
    const [photos, setPhotos] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const patientIds = user?.linkedPatientIds && user.linkedPatientIds.length > 0 ? user.linkedPatientIds : user ? [user.uid] : [];
    useEffect(() => {
        // Initialize selectedPatientId when user becomes available
        if (!selectedPatientId && patientIds.length > 0) {
            setSelectedPatientId(patientIds[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid, user]);
    useEffect(() => {
        if (!selectedPatientId)
            return;
        (async () => {
            try {
                const resp = await api.get(`/photos/patient/${selectedPatientId}`);
                setPhotos(resp.data || []);
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.warn("Failed to load patient gallery", err);
                setPhotos([]);
            }
        })();
    }, [selectedPatientId]);
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { align: "stretch", spacing: 6, children: [_jsxs(Box, { children: [_jsx(Heading, { mb: 2, children: "Galer\u00EDa de Fotos" }), _jsx(Text, { color: "gray.600", children: "Todas las fotos que tus cuidadores han subido para ti." })] }), patientIds.length > 1 && (_jsxs(Box, { children: [_jsx(Text, { mb: 2, fontSize: "sm", color: "gray.600", children: "Ver fotos de:" }), _jsx(Select, { value: selectedPatientId ?? "", onChange: (e) => setSelectedPatientId(e.target.value), maxW: "sm", children: patientIds.map((pid) => (_jsx("option", { value: pid, children: pid }, pid))) })] })), _jsx(PhotoGallery, { photos: photos, canEdit: false, canDelete: false })] }) })] })] }));
}
