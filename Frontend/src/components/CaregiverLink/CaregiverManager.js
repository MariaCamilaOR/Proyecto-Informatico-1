import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Button, Card, CardBody, CardHeader, Heading, Text, VStack, HStack, Badge, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, FormControl, FormLabel, Input, Textarea, Select, useToast, Table, Thead, Tbody, Tr, Th, Td, Alert, AlertIcon, } from "@chakra-ui/react";
import { useState } from "react";
import { FaTrash, FaUserPlus, FaEye, FaEdit } from "react-icons/fa";
export function CaregiverManager({ patientId, canManage = false }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedCaregiver, setSelectedCaregiver] = useState(null);
    const [invitationForm, setInvitationForm] = useState({
        email: "",
        relationship: "",
        message: "",
    });
    const toast = useToast();
    // Datos demo
    const [caregivers] = useState([
        {
            id: "caregiver-1",
            caregiverId: "user-123",
            patientId: patientId,
            relationship: "Hijo",
            status: "active",
            createdAt: "2023-10-01",
            updatedAt: "2023-10-15",
            permissions: [
                { id: "perm-1", type: "view_photos", granted: true, grantedAt: "2023-10-01" },
                { id: "perm-2", type: "upload_photos", granted: true, grantedAt: "2023-10-01" },
                { id: "perm-3", type: "view_reports", granted: true, grantedAt: "2023-10-01" },
                { id: "perm-4", type: "manage_reminders", granted: false },
                { id: "perm-5", type: "view_sessions", granted: true, grantedAt: "2023-10-01" },
            ],
        },
        {
            id: "caregiver-2",
            caregiverId: "user-456",
            patientId: patientId,
            relationship: "Cuidador profesional",
            status: "pending",
            createdAt: "2023-10-20",
            updatedAt: "2023-10-20",
            permissions: [
                { id: "perm-6", type: "view_photos", granted: false },
                { id: "perm-7", type: "upload_photos", granted: false },
                { id: "perm-8", type: "view_reports", granted: false },
                { id: "perm-9", type: "manage_reminders", granted: false },
                { id: "perm-10", type: "view_sessions", granted: false },
            ],
        },
    ]);
    const [invitations] = useState([
        {
            id: "inv-1",
            patientId: patientId,
            caregiverEmail: "maria@ejemplo.com",
            relationship: "Hija",
            message: "Soy tu hija María, me gustaría ayudarte con la aplicación.",
            status: "pending",
            expiresAt: "2023-11-01",
            createdAt: "2023-10-22",
        },
    ]);
    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "green";
            case "pending":
                return "yellow";
            case "rejected":
                return "red";
            case "revoked":
                return "gray";
            default:
                return "gray";
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case "active":
                return "Activo";
            case "pending":
                return "Pendiente";
            case "rejected":
                return "Rechazado";
            case "revoked":
                return "Revocado";
            default:
                return status;
        }
    };
    const handleSendInvitation = () => {
        if (!invitationForm.email || !invitationForm.relationship) {
            toast({
                title: "Campos requeridos",
                description: "Por favor completa el email y la relación.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        // Simular envío de invitación
        toast({
            title: "Invitación enviada",
            description: `Se envió una invitación a ${invitationForm.email}`,
            status: "success",
            duration: 3000,
            isClosable: true,
        });
        setInvitationForm({ email: "", relationship: "", message: "" });
        onClose();
    };
    const handleAcceptInvitation = (invitationId) => {
        toast({
            title: "Invitación aceptada",
            description: "El cuidador ha sido vinculado exitosamente.",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };
    const handleRejectInvitation = (invitationId) => {
        toast({
            title: "Invitación rechazada",
            description: "La invitación ha sido rechazada.",
            status: "info",
            duration: 3000,
            isClosable: true,
        });
    };
    const handleRevokeCaregiver = (caregiverId) => {
        toast({
            title: "Cuidador revocado",
            description: "El acceso del cuidador ha sido revocado.",
            status: "warning",
            duration: 3000,
            isClosable: true,
        });
    };
    return (_jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsxs(HStack, { justify: "space-between", children: [_jsxs(Box, { children: [_jsx(Heading, { size: "md", children: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66 Gesti\u00F3n de Cuidadores" }), _jsx(Text, { color: "gray.600", children: "Administra los cuidadores vinculados a este paciente" })] }), canManage && (_jsx(Button, { leftIcon: _jsx(FaUserPlus, {}), colorScheme: "blue", onClick: onOpen, children: "Invitar Cuidador" }))] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(Heading, { size: "sm", children: ["Cuidadores Vinculados (", caregivers.length, ")"] }) }), _jsx(CardBody, { children: caregivers.length === 0 ? (_jsxs(Alert, { status: "info", children: [_jsx(AlertIcon, {}), "No hay cuidadores vinculados a\u00FAn."] })) : (_jsxs(Table, { variant: "simple", children: [_jsx(Thead, { children: _jsxs(Tr, { children: [_jsx(Th, { children: "Relaci\u00F3n" }), _jsx(Th, { children: "Estado" }), _jsx(Th, { children: "Permisos" }), _jsx(Th, { children: "Fecha" }), _jsx(Th, { children: "Acciones" })] }) }), _jsx(Tbody, { children: caregivers.map((caregiver) => (_jsxs(Tr, { children: [_jsx(Td, { children: caregiver.relationship }), _jsx(Td, { children: _jsx(Badge, { colorScheme: getStatusColor(caregiver.status), children: getStatusText(caregiver.status) }) }), _jsx(Td, { children: _jsxs(Text, { fontSize: "sm", children: [caregiver.permissions.filter(p => p.granted).length, " de ", caregiver.permissions.length, " permisos"] }) }), _jsx(Td, { children: _jsx(Text, { fontSize: "sm", children: caregiver.createdAt }) }), _jsx(Td, { children: _jsxs(HStack, { children: [_jsx(IconButton, { "aria-label": "Ver detalles", icon: _jsx(FaEye, {}), size: "sm", variant: "ghost" }), canManage && (_jsxs(_Fragment, { children: [_jsx(IconButton, { "aria-label": "Editar permisos", icon: _jsx(FaEdit, {}), size: "sm", variant: "ghost" }), _jsx(IconButton, { "aria-label": "Revocar acceso", icon: _jsx(FaTrash, {}), size: "sm", variant: "ghost", colorScheme: "red", onClick: () => handleRevokeCaregiver(caregiver.id) })] }))] }) })] }, caregiver.id))) })] })) })] }), invitations.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(Heading, { size: "sm", children: ["Invitaciones Pendientes (", invitations.length, ")"] }) }), _jsx(CardBody, { children: _jsx(VStack, { spacing: 4, align: "stretch", children: invitations.map((invitation) => (_jsx(Box, { p: 4, borderWidth: "1px", borderRadius: "md", children: _jsxs(VStack, { align: "start", spacing: 2, children: [_jsxs(HStack, { justify: "space-between", w: "full", children: [_jsx(Text, { fontWeight: "bold", children: invitation.caregiverEmail }), _jsx(Badge, { colorScheme: "yellow", children: "Pendiente" })] }), _jsxs(Text, { fontSize: "sm", color: "gray.600", children: ["Relaci\u00F3n: ", invitation.relationship] }), invitation.message && (_jsxs(Text, { fontSize: "sm", color: "gray.600", children: ["Mensaje: ", invitation.message] })), _jsxs(Text, { fontSize: "xs", color: "gray.500", children: ["Expira: ", invitation.expiresAt] }), canManage && (_jsxs(HStack, { children: [_jsx(Button, { size: "sm", colorScheme: "green", onClick: () => handleAcceptInvitation(invitation.id), children: "Aceptar" }), _jsx(Button, { size: "sm", colorScheme: "red", variant: "outline", onClick: () => handleRejectInvitation(invitation.id), children: "Rechazar" })] }))] }) }, invitation.id))) }) })] })), _jsxs(Modal, { isOpen: isOpen, onClose: onClose, children: [_jsx(ModalOverlay, {}), _jsxs(ModalContent, { children: [_jsx(ModalHeader, { children: "Invitar Nuevo Cuidador" }), _jsx(ModalCloseButton, {}), _jsx(ModalBody, { children: _jsxs(VStack, { spacing: 4, children: [_jsxs(FormControl, { children: [_jsx(FormLabel, { children: "Email del cuidador" }), _jsx(Input, { type: "email", value: invitationForm.email, onChange: (e) => setInvitationForm({ ...invitationForm, email: e.target.value }), placeholder: "cuidador@ejemplo.com" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { children: "Relaci\u00F3n con el paciente" }), _jsxs(Select, { value: invitationForm.relationship, onChange: (e) => setInvitationForm({ ...invitationForm, relationship: e.target.value }), placeholder: "Selecciona la relaci\u00F3n", children: [_jsx("option", { value: "hijo", children: "Hijo/Hija" }), _jsx("option", { value: "esposo", children: "Esposo/Esposa" }), _jsx("option", { value: "hermano", children: "Hermano/Hermana" }), _jsx("option", { value: "padre", children: "Padre/Madre" }), _jsx("option", { value: "cuidador", children: "Cuidador profesional" }), _jsx("option", { value: "amigo", children: "Amigo/Amiga" }), _jsx("option", { value: "otro", children: "Otro" })] })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { children: "Mensaje personal (opcional)" }), _jsx(Textarea, { value: invitationForm.message, onChange: (e) => setInvitationForm({ ...invitationForm, message: e.target.value }), placeholder: "Escribe un mensaje personal para el cuidador...", rows: 3 })] })] }) }), _jsxs(ModalFooter, { children: [_jsx(Button, { variant: "ghost", mr: 3, onClick: onClose, children: "Cancelar" }), _jsx(Button, { colorScheme: "blue", onClick: handleSendInvitation, children: "Enviar Invitaci\u00F3n" })] })] })] })] }));
}
