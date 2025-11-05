import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Heading, Text, Flex, VStack, Card, CardBody, HStack, Button, Badge, Spinner, Alert, AlertIcon } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { useInboxNotifications, useMarkNotificationRead } from "../../hooks/useAlerts";
import { useNavigate } from "react-router-dom";
import { normalizeRole } from "../../lib/roles";

export default function AlertsSettings() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const navigate = useNavigate();

  const isPatient = role === "PATIENT";
  const patientId = (isPatient && user) ? user.uid : undefined;

  const { data, isLoading, isError } = useInboxNotifications(patientId);
  const { mutateAsync: markRead } = useMarkNotificationRead();

  const handleAction = async (n) => {
    try {
      if (n.type === "quiz_invite" && n.payload?.quizId) {
        await markRead(n.id);
        navigate(`/quiz/take/${n.payload.quizId}`);
      } else if (n.type === "baseline_request") {
        await markRead(n.id);
        navigate(`/describe/wizard`);
      } else {
        await markRead(n.id);
      }
    } catch {}
  };

  return (_jsxs(Box, { children: [
    _jsx(Navbar, {}),
    _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [
      _jsx(Sidebar, {}),
      _jsxs(Box, { flex: "1", p: { base: 4, md: 6 }, children: [
        _jsx(Heading, { mb: 6, children: "Alertas" }),

        !isPatient && (_jsx(Alert, { status: "info", mb: 4, children: _jsxs(_jsxs, { children: [_jsx(AlertIcon, {}), "Esta vista muestra la bandeja del paciente con invitaciones a quizzes y solicitudes de l\xEDnea base."] }) })),

        isLoading ? (
          _jsxs(HStack, { children: [_jsx(Spinner, {}), _jsx(Text, { children: "Cargando alertas…" })] })
        ) : isError ? (
          _jsx(Alert, { status: "warning", children: _jsxs(_jsxs, { children: [_jsx(AlertIcon, {}), "No se pudieron cargar las alertas."] }) })
        ) : (
          _jsx(VStack, { align: "stretch", spacing: 4, children:
            (!data || data.length === 0)
              ? _jsx(Card, { children: _jsx(CardBody, { children: _jsx(Text, { children: "No hay alertas." }) }) })
              : data.map((n) => (
                  _jsx(Card, { children: _jsx(CardBody, { children:
                    _jsxs(VStack, { align: "stretch", spacing: 2, children: [
                      _jsxs(HStack, { justify: "space-between", children: [
                        _jsxs(HStack, { children: [
                          _jsx(Badge, { colorScheme: n.type === "quiz_invite" ? "purple" : n.type === "baseline_request" ? "blue" : "gray", children: n.type }),
                          _jsx(Text, { fontWeight: "bold", children: n.title || "Notificación" })
                        ] }),
                        !n.read && _jsx(Badge, { colorScheme: "green", children: "Nueva" })
                      ] }),
                      n.message && _jsx(Text, { fontSize: "sm", color: "gray.600", children: n.message }),
                      _jsxs(HStack, { justify: "flex-end", pt: 2, children: [
                        (n.type === "quiz_invite" && n.payload?.quizId) && _jsx(Button, { size: "sm", colorScheme: "purple", onClick: () => handleAction(n), children: "Realizar quiz" }),
                        n.type === "baseline_request" && _jsx(Button, { size: "sm", colorScheme: "blue", onClick: () => handleAction(n), children: "Completar línea base" }),
                        _jsx(Button, { size: "sm", variant: "outline", onClick: () => markRead(n.id), children: "Marcar como leída" })
                      ] })
                    ] })
                  }) }, n.id)
                ))
          })
        )
      ] })
    ] })
  ] }));
}
