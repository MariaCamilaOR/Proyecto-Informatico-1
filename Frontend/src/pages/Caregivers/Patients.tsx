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

export default function CaregiversPatients() {
  const { user } = useAuth();

  const canViewPatients = user && hasPermission(user.role, "view_patient_reports");

  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const loadPatients = async () => {
    setLoading(true);
    try {
      const resp = await api.get(`/patients`);
      setPatients(resp.data || []);
    } catch (e) {
      console.error("Failed to load patients", e);
      toast({ title: "Error", description: "No se pudieron cargar los pacientes.", status: "error", duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canViewPatients) loadPatients();
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
                {user?.role === "DOCTOR" ? "👩‍⚕️ Todos los Pacientes" : "👥 Mis Pacientes"}
              </Heading>
              <Text color="blue.600">
                {user?.role === "DOCTOR" 
                  ? "Pacientes bajo tu supervisión médica"
                  : "Pacientes vinculados a tu cuenta de cuidador"
                }
              </Text>
            </Box>

            {patients.length === 0 ? (
              <Card>
                <CardBody>
                  <Alert status="info">
                    <AlertIcon />
                    {user?.role === "DOCTOR" 
                        ? "No hay pacientes registrados en el sistema aún."
                        : "No hay pacientes disponibles."
                      }
                  </Alert>
                </CardBody>
              </Card>
            ) : (
              <VStack spacing={4} align="stretch">
                {patients.map((patient: any) => (
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
                            {/* view/profile/report buttons could be implemented later */}
                            {patient.assignedCaregiverId ? (
                              patient.assignedCaregiverId === user?.uid ? (
                                <Button size="sm" colorScheme="gray" isDisabled>Asignado a ti</Button>
                              ) : (
                                <Button size="sm" colorScheme="gray" isDisabled>Asignado a otro</Button>
                              )
                            ) : (
                              <Button size="sm" colorScheme="green" onClick={async () => {
                                try {
                                  await api.post(`/patients/${patient.id}/assign`);
                                  toast({ title: "Asignado", description: "Te has asignado como cuidador.", status: "success", duration: 3000 });
                                  await loadPatients();
                                } catch (err: any) {
                                  console.error("Assign failed", err);
                                  if (err?.response?.status === 409) {
                                    toast({ title: "No disponible", description: "El paciente ya está asignado.", status: "warning", duration: 4000 });
                                  } else {
                                    toast({ title: "Error", description: "No se pudo asignar al paciente.", status: "error", duration: 4000 });
                                  }
                                }
                              }}>Asignarme</Button>
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
