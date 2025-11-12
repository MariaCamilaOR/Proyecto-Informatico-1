import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Heading, Text, Flex, VStack, Card, CardBody, Alert, AlertIcon, Select, FormControl, FormLabel } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { api } from "../../api";
import { PhotoGallery } from "../../components/PhotoGallery/PhotoGallery";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { PhotoUploader } from "../../components/PhotoUpload/PhotoUploader";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
export default function PhotosUpload() {
    const { user } = useAuth();
    const [photos, setPhotos] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const canUpload = !!user && (hasPermission(user.role, "upload_photos") || hasPermission(user.role, "upload_photos_for_patient"));
    const loadPhotos = async () => {
        try {
            const patientId = selectedPatientId || user?.linkedPatientIds?.[0] || "demo-patient-123";
            const resp = await api.get(`/photos/patient/${patientId}`);
            setPhotos(resp.data || []);
        }
        catch (e) {
            console.error("loadPhotos error:", e?.response?.status, e?.response?.data || e.message || e);
        }
    };
    useEffect(() => {
        loadPhotos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid, selectedPatientId]);
    const handlePhotoUpload = (files) => {
        const upload = async () => {
            try {
                const form = new FormData();
                files.forEach((f) => form.append("files", f));
                const patientId = selectedPatientId || user?.linkedPatientIds?.[0] || "demo-patient-123";
                form.append("patientId", patientId);
                await api.post(`/photos/upload`, form);
                await loadPhotos();
            }
            catch (e) {
                console.error("Upload failed", e);
            }
        };
        upload();
    };
    if (!canUpload) {
        return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(Alert, { status: "warning", children: [_jsx(AlertIcon, {}), "No tienes permisos para subir fotos con tu rol actual."] }) })] })] }));
    }
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(Box, { children: [_jsx(Heading, { mb: 2, children: "\uD83D\uDCF8 Subir Fotos Familiares" }), _jsx(Text, { color: "blue.600", children: "Sube fotos de familia, amigos y lugares importantes." })] }), _jsx(Card, { children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, children: [user && String(user.role || "").toUpperCase() === "CAREGIVER" && (_jsxs(FormControl, { children: [_jsx(FormLabel, { children: "Subir para paciente" }), _jsx(Select, { placeholder: "Selecciona paciente", value: selectedPatientId || '', onChange: (e) => setSelectedPatientId(e.target.value || null), children: (user.linkedPatientIds || []).map((pid) => (_jsx("option", { value: pid, children: pid }, pid))) })] })), _jsx(PhotoUploader, { onUpload: handlePhotoUpload, maxFiles: 10, maxSizeMB: 5, acceptedFormats: ["image/jpeg", "image/jpg", "image/png"] })] }) }) }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx(Heading, { size: "md", mb: 4, children: "\uD83D\uDCDA Galer\u00EDa" }), _jsx(PhotoGallery, { photos: photos, canEdit: false, canDelete: false })] }) })] }) })] })] }));
}
