import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Heading, Text, Flex, VStack, Card, CardBody, HStack,
  Button, Badge, Spinner, Alert, AlertIcon
} from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { listMyAlerts, markAlertRead } from "../../hooks/useAlerts";
import { useNavigate } from "react-router-dom";
import { normalizeRole } from "../../lib/roles";

type NotificationItem = {
  id: string;
  type: "quiz_invite" | "quiz_request" | "baseline_request" | string;
  title?: string | null;
  message?: string | null;
  payload?: any;
  read?: boolean;
};

export default function AlertsSettings() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role as any);
  const navigate = useNavigate();

  const isPatient = role === "PATIENT";
  const patientId = useMemo(() => {
    if (!user) return undefined as unknown as string;
    if (role === "PATIENT") return user.uid;
    return undefined as unknown as string;
  }, [user, role]);

  const [alerts, setAlerts] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await listMyAlerts();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message || "No se pudieron cargar las alertas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [patientId]);

  const handleMarkRead = async (id: string) => {
    try {
      await markAlertRead(id);
      setAlerts((prev) => prev.map(a => a.id === id ? { ...a, read: true } : a));
    } catch {}
  };

  const handleAction = async (n: NotificationItem) => {
    try {
      if ((n.type === "quiz_invite" || n.type === "quiz_request") && n.payload?.quizId) {
        await handleMarkRead(n.id);
        navigate(`/quiz/take/${n.payload.quizId}`);
      } else if (n.type === "baseline_request") {
        await handleMarkRead(n.id);
        navigate(`/describe/wizard`);
      } else {
        await handleMarkRead(n.id);
      }
    } catch {}
  };

  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <Heading mb={6}>Alertas</Heading>

          {!isPatient && (
            <Alert status="info" mb={4}>
              <AlertIcon />
              Esta vista muestra la bandeja del paciente con invitaciones a quizzes y solicitudes de línea base.
            </Alert>
          )}

          {loading ? (
            <HStack><Spinner /><Text>Cargando alertas…</Text></HStack>
          ) : err ? (
            <Alert status="warning"><AlertIcon />{err}</Alert>
          ) : (
            <VStack align="stretch" spacing={4}>
              {alerts.length === 0 ? (
                <Card><CardBody><Text>No hay alertas.</Text></CardBody></Card>
              ) : alerts.map((n) => (
                <Card key={n.id}>
                  <CardBody>
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <HStack>
                          <Badge colorScheme={
                            n.type === "quiz_invite" || n.type === "quiz_request" ? "purple" :
                            n.type === "baseline_request" ? "blue" : "gray"
                          }>
                            {n.type}
                          </Badge>
                          <Text fontWeight="bold">{n.title || "Notificación"}</Text>
                        </HStack>
                        {!n.read && <Badge colorScheme="green">Nueva</Badge>}
                      </HStack>

                      {n.message && <Text fontSize="sm" color="gray.600">{n.message}</Text>}

                      <HStack justify="flex-end" pt={2}>
                        {(n.type === "quiz_invite" || n.type === "quiz_request") && n.payload?.quizId && (
                          <Button size="sm" colorScheme="purple" onClick={() => handleAction(n)}>
                            Realizar quiz
                          </Button>
                        )}
                        {n.type === "baseline_request" && (
                          <Button size="sm" colorScheme="blue" onClick={() => handleAction(n)}>
                            Completar línea base
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleMarkRead(n.id)}>
                          Marcar como leída
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
