import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  Card,
  CardBody,
  HStack,
  Badge,
  Button,
  Avatar,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { FaEye, FaChartLine, FaCamera } from "react-icons/fa";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useToast } from "@chakra-ui/react";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/react";

export default function CaregiversPatients() {
  const { user } = useAuth();

  const canViewPatients = user && hasPermission(user.role, "view_patient_reports");

  const [patients, setPatients] = useState<any[]>([]);
  const [linkedPatients, setLinkedPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const loadPatients = async (email?: string) => {
    setLoading(true);
    try {
      const url = email ? `/patients?email=${encodeURIComponent(email)}` : `/patients`;
      const resp = await api.get(url);
      // Defensive: exclude the current user if they somehow appear in the patients list
      const all = resp.data || [];
      // Defensive: only include items that look like patients. Backend already filters by role but be safe.
      const filtered = all
        .filter((p: any) => p && p.id && p.id !== user?.uid)
        .filter((p: any) => {
          const role = String(p?.raw?.role || "").toLowerCase();
          return !role || role === "patient"; // allow if role missing for backward compat, otherwise require 'patient'
        });
      setPatients(filtered);
    } catch (e) {
      console.error("Failed to load patients", e);
      toast({ title: "Error", description: "No se pudieron cargar los pacientes.", status: "error", duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const loadLinkedPatients = async () => {
    if (!user) return;
    try {
      const ids = user.linkedPatientIds || [];
      const list: any[] = [];
      for (const id of ids) {
        try {
          const resp = await api.get(`/patients/${id}`);
          // Defensive: ensure backend returned a patient role for this id
          const pd = resp.data;
          const roleRaw = String(pd?.raw?.role || "").toLowerCase();
          if (!roleRaw || roleRaw === "patient") {
            list.push(pd);
          } else {
            // skip non-patient roles
          }
        } catch (err) {
          // skip missing
        }
      }
      // Exclude the caregiver themself if for some reason their user id appears in the linked patients
      const filtered = list.filter((p) => p && p.id && p.id !== user.uid);
      setLinkedPatients(filtered);
    } catch (e) {
      console.error("Failed to load linked patients", e);
    }
  };

  const [inviteCodeInput, setInviteCodeInput] = useState<string>("");

  const onAddByCode = async () => {
    const code = inviteCodeInput.trim();
    if (!code) return toast({ title: "Ingrese un código", status: "warning", duration: 2000 });
    try {
      await api.post(`/patients/assign-by-code`, { code });
      toast({ title: "Asignado", description: "Paciente agregado a tu lista.", status: "success", duration: 3000 });
      setInviteCodeInput("");
      await loadLinkedPatients();
    } catch (err: any) {
      console.error("Assign by code failed", err);
      const status = err?.response?.status;
      if (status === 404) toast({ title: "No encontrado", description: "Código inválido.", status: "error", duration: 4000 });
      else if (status === 409) toast({ title: "No disponible", description: "El paciente ya está asignado a otro cuidador.", status: "warning", duration: 4000 });
      else toast({ title: "Error", description: "No se pudo asignar por código.", status: "error", duration: 4000 });
    }
  };

  useEffect(() => {
    if (canViewPatients) {
      loadPatients();
      loadLinkedPatients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  if (!canViewPatients) {
    return (
      <Box>
        <Navbar />
        <Flex direction={{ base: "column", md: "row" }}>
          <Sidebar />
          <Box flex="1" p={{ base: 4, md: 6 }}>
            <Alert status="warning">
              <AlertIcon />
              No tienes permisos para ver pacientes con tu rol actual.
            </Alert>
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading mb={2}>
                {user?.role === "DOCTOR"
                  ? "👩‍⚕️ Todos los Pacientes"
                  : `👥 Pacientes bajo el cuidado de ${user?.displayName ?? "este cuidador"}`}
              </Heading>
              <Text color="blue.600">
                {user?.role === "DOCTOR"
                  ? "Pacientes bajo tu supervisión médica"
                  : `Lista de pacientes asignados a ${user?.displayName ?? "este cuidador"}.`}
              </Text>
            </Box>

            {/* paste invite code to add patient */}
            <Box>
              <InputGroup maxW="lg">
                <Input placeholder="Pegar código de invitación..." value={inviteCodeInput} onChange={(e) => setInviteCodeInput(e.target.value)} />
                <InputRightElement width="6.5rem">
                  <Button h="1.75rem" size="sm" onClick={onAddByCode}>Agregar</Button>
                </InputRightElement>
              </InputGroup>
            </Box>

            {/* Show linked patients (those already assigned to this caregiver) */}
            {linkedPatients.length === 0 ? (
              <Card>
                <CardBody>
                  <Alert status="info">
                    <AlertIcon />
                    {user?.role === "DOCTOR" 
                        ? "No tienes pacientes enlazados aún."
                        : "No tienes pacientes añadidos. Pega el código de invitación del paciente para añadirlo."
                      }
                  </Alert>
                </CardBody>
              </Card>
            ) : (
              <VStack spacing={4} align="stretch">
                {linkedPatients.map((patient: any) => (
                  <Card key={patient.id}>
                    <CardBody>
                      <HStack justify="space-between" align="start">
                        <HStack spacing={4}>
                          <Avatar
                            name={patient.displayName || patient.id}
                            src={undefined}
                            size="lg"
                          />
                          <VStack align="start" spacing={1}>
                            <Heading size="md">{patient.displayName || patient.id}</Heading>
                            <Text color="blue.600" fontSize="sm">
                              {patient.email || "—"}
                            </Text>
                            <HStack spacing={4}>
                              <Badge colorScheme={patient.assignedCaregiverId ? "gray" : "green"}>{patient.assignedCaregiverId ? "Asignado" : "Disponible"}</Badge>
                            </HStack>
                          </VStack>
                        </HStack>

                        <VStack spacing={2} align="end">
                          <HStack spacing={2}>
                            {patient.assignedCaregiverId === user?.uid ? (
                              <Button size="sm" colorScheme="red" onClick={async () => {
                                try {
                                  await api.post(`/patients/${patient.id}/unassign`);
                                  toast({ title: "Desasignado", description: "Ya no eres el cuidador de este paciente.", status: "success", duration: 3000 });
                                  await loadLinkedPatients();
                                } catch (err: any) {
                                  console.error("Unassign failed", err);
                                  toast({ title: "Error", description: "No se pudo desasignar al paciente.", status: "error", duration: 4000 });
                                }
                              }}>Desasignarme</Button>
                            ) : (
                              <Button size="sm" colorScheme="gray" isDisabled>Asignado a otro</Button>
                            )}
                          </HStack>
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}

            {/* Información adicional */}
            <Box p={4} bg="green.50" borderRadius="md">
              <VStack spacing={3} align="start">
                <Text fontWeight="bold">
                  {user?.role === "DOCTOR" ? "💡 Como médico puedes:" : "💡 Como cuidador puedes:"}
                </Text>
                <VStack align="start" spacing={1} fontSize="sm" color="blue.600">
                  {user?.role === "DOCTOR" ? (
                    <>
                      <Text>• Ver el progreso y reportes de todos los pacientes</Text>
                      <Text>• Generar reportes detallados y análisis</Text>
                      <Text>• Configurar políticas de alertas globales</Text>
                      <Text>• Exportar datos para análisis médico</Text>
                    </>
                  ) : (
                    <>
                      <Text>• Ver el progreso y reportes de tus pacientes</Text>
                      <Text>• Subir fotos en nombre del paciente</Text>
                      <Text>• Configurar recordatorios para sesiones</Text>
                      <Text>• Recibir alertas sobre cambios importantes</Text>
                    </>
                  )}
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
