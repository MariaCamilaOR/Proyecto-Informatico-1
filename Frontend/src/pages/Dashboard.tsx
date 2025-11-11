import { Box, Heading, Text, Grid, GridItem, Card, CardBody, Flex, Badge, VStack, HStack, Button, Progress } from "@chakra-ui/react";
import { Navbar } from "../components/Layout/Navbar";
import { Sidebar } from "../components/Layout/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { normalizeRole } from "../lib/roles";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role as any);
  const nav = useNavigate();
  const [photoCount, setPhotoCount] = useState<number | null>(null);
  const [lastUploaded, setLastUploaded] = useState<string | null>(null);
  const [patientStats, setPatientStats] = useState<Array<{
    patientId: string;
    displayName: string;
    email: string;
    averageRecall: number;
    lastSession?: Date;
    sessionsCompleted: number;
  }>>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      if (role === "DOCTOR") {
        try {
          // Cargar lista de pacientes asignados
          const patientsResp = await api.get(`/patients/doctor/${user.uid}`);
          const patients = patientsResp.data || [];

          // Cargar estadísticas para cada paciente
          const stats = await Promise.all(
            patients.map(async (patient: any) => {
              try {
                const statsResp = await api.get(`/reports/summary/${patient.id}?days=30`);
                return {
                  patientId: patient.id,
                  displayName: patient.displayName || 'Sin nombre',
                  email: patient.email || 'Sin correo',
                  averageRecall: statsResp.data.recallPct || 0,
                  lastSession: statsResp.data.lastSession ? new Date(statsResp.data.lastSession) : undefined,
                  sessionsCompleted: statsResp.data.sessionsCompleted || 0,
                };
              } catch (err) {
                console.error(`Error loading stats for patient ${patient.id}:`, err);
                return null;
              }
            })
          );

          setPatientStats(stats.filter(s => s !== null));
        } catch (err) {
          console.error("Error loading patient stats:", err);
        }
      } else {
        // Cargar fotos para pacientes/cuidadores
        const patientId = user.linkedPatientIds?.[0] || "demo-patient-123";
        try {
          const resp = await api.get(`/photos/patient/${patientId}`);
          const items: any[] = resp.data || [];
          setPhotoCount(items.length);
          if (items.length > 0) {
            const dates = items.map((it) => (it.createdAt ? new Date(it.createdAt) : null)).filter(Boolean) as Date[];
            if (dates.length > 0) {
              const latest = new Date(Math.max(...dates.map((d) => d.getTime())));
              setLastUploaded(latest.toLocaleString());
            } else {
              setLastUploaded(null);
            }
          } else {
            setLastUploaded(null);
          }
        } catch (e) {
          console.error("Failed to load photos for dashboard", e);
          setPhotoCount(null);
          setLastUploaded(null);
        }
      }
    };
    loadData();
  }, [user?.uid, role]);

  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <Box className="portal">
            <VStack align="stretch" spacing={6}>
            <Box>
              <Heading mb={2}>Dashboard</Heading>
              <Text color="blue.600">Bienvenido al prototipo de DoYouRemember</Text>
            </Box>

            {/* KPIs demo */}
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
              <GridItem>
                <Card><CardBody>
                  <HStack justify="space-between" mb={2}>
                    <Heading size="sm">📸 Fotos Subidas</Heading>
                    <Badge colorScheme="blue">Cuenta</Badge>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">{photoCount === null ? '—' : photoCount}</Text>
                  <Text fontSize="sm" color="blue.500">Última: {lastUploaded || 'Nunca'}</Text>
                </CardBody></Card>
              </GridItem>
              <GridItem>
                <Card><CardBody>
                  <HStack justify="space-between" mb={2}>
                    <Heading size="sm">🎯 Sesiones Completadas</Heading>
                    <Badge colorScheme="green">Demo</Badge>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">8</Text>
                  <Text fontSize="sm" color="blue.500">Promedio: 85%</Text>
                </CardBody></Card>
              </GridItem>
              <GridItem>
                <Card><CardBody>
                  <HStack justify="space-between" mb={2}>
                    <Heading size="sm">📊 Reportes Generados</Heading>
                    <Badge colorScheme="purple">Demo</Badge>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.500">3</Text>
                  <Text fontSize="sm" color="blue.500">Último: ayer</Text>
                </CardBody></Card>
              </GridItem>
            </Grid>
              {role === "DOCTOR" ? (
                <>
                  <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                    <GridItem>
                      <Card>
                        <CardBody>
                          <HStack justify="space-between" mb={2}>
                            <Heading size="sm">👥 Total Pacientes</Heading>
                            <Badge colorScheme="blue">Activos</Badge>
                          </HStack>
                          <Text fontSize="2xl" fontWeight="bold" color="blue.500">{patientStats.length}</Text>
                        </CardBody>
                      </Card>
                    </GridItem>
                    <GridItem>
                      <Card>
                        <CardBody>
                          <HStack justify="space-between" mb={2}>
                            <Heading size="sm">📊 Promedio General</Heading>
                            <Badge colorScheme="green">Memory Recall</Badge>
                          </HStack>
                          <Text fontSize="2xl" fontWeight="bold" color="green.500">
                            {patientStats.length > 0 
                              ? Math.round(patientStats.reduce((sum, p) => sum + p.averageRecall, 0) / patientStats.length)
                              : 0}%
                          </Text>
                        </CardBody>
                      </Card>
                    </GridItem>
                  </Grid>

                  {/* Lista de Pacientes con Memory Recall */}
                  <Card>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Heading size="md">📈 Memory Recall por Paciente</Heading>
                        {patientStats.length > 0 ? (
                          patientStats
                            .sort((a, b) => b.averageRecall - a.averageRecall)
                            .map((patient) => (
                              <Box 
                                key={patient.patientId} 
                                p={3} 
                                borderWidth="1px" 
                                borderRadius="md"
                                cursor="pointer"
                                onClick={() => nav(`/doctors/patient/${patient.patientId}`)}
                                _hover={{ bg: "gray.50" }}
                                transition="background 0.2s"
                              >
                                <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                                  <Box>
                                    <Text fontWeight="bold">{patient.displayName}</Text>
                                    <Text fontSize="sm" color="gray.600">{patient.email}</Text>
                                  </Box>
                                  <Box>
                                    <Text fontSize="sm" color="gray.600">Memory Recall</Text>
                                    <Progress 
                                      value={patient.averageRecall} 
                                      size="sm" 
                                      colorScheme={patient.averageRecall >= 70 ? "green" : patient.averageRecall >= 50 ? "yellow" : "red"}
                                    />
                                    <Text fontSize="sm" fontWeight="bold" mt={1}>{patient.averageRecall}%</Text>
                                  </Box>
                                  <Box>
                                    <Text fontSize="sm" color="gray.600">Sesiones Completadas</Text>
                                    <Text fontWeight="bold">{patient.sessionsCompleted}</Text>
                                    {patient.lastSession && (
                                      <Text fontSize="xs" color="gray.500">
                                        Última: {patient.lastSession.toLocaleDateString()}
                                      </Text>
                                    )}
                                  </Box>
                                </Grid>
                              </Box>
                            ))
                        ) : (
                          <Text color="gray.600">No hay pacientes asignados aún</Text>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </>
              ) : (
                <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                  <GridItem>
                    <Card><CardBody>
                      <HStack justify="space-between" mb={2}>
                        <Heading size="sm">📸 Fotos Subidas</Heading>
                        <Badge colorScheme="blue">Cuenta</Badge>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.500">{photoCount === null ? '—' : photoCount}</Text>
                      <Text fontSize="sm" color="blue.500">Última: {lastUploaded || 'Nunca'}</Text>
                    </CardBody></Card>
                  </GridItem>
                  <GridItem>
                    <Card><CardBody>
                      <HStack justify="space-between" mb={2}>
                        <Heading size="sm">🎯 Sesiones Completadas</Heading>
                        <Badge colorScheme="green">Demo</Badge>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="green.500">8</Text>
                      <Text fontSize="sm" color="blue.500">Promedio: 85%</Text>
                    </CardBody></Card>
                  </GridItem>
                  <GridItem>
                    <Card><CardBody>
                      <HStack justify="space-between" mb={2}>
                        <Heading size="sm">📊 Reportes Generados</Heading>
                        <Badge colorScheme="purple">Demo</Badge>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="purple.500">3</Text>
                      <Text fontSize="sm" color="blue.500">Último: ayer</Text>
                    </CardBody></Card>
                  </GridItem>
                </Grid>
              )}
            {/* Acciones rápidas por rol */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>🚀 Acciones rápidas</Heading>
                <HStack spacing={3} wrap="wrap">
                  {role === "PATIENT" && (
                    <>
                      <Button onClick={() => nav("/patient/caretaker")} colorScheme="teal">Mi cuidador</Button>
                      <Button onClick={() => nav("/quiz/available")} colorScheme="blue">Mis cuestionarios</Button>
                      <Button onClick={() => nav("/reminders")} variant="ghost">Recordatorios</Button>
                    </>
                  )}
                  {role === "CAREGIVER" && (
                    <>
                      <Button onClick={() => nav("/photos")} colorScheme="blue">Fotos del paciente</Button>
                      <Button onClick={() => nav("/cuidador/photos/upload")} colorScheme="blue">Subir fotos</Button>
                      <Button onClick={() => nav("/caregivers/patients")} variant="outline">Mis Pacientes</Button>
                      <Button onClick={() => nav("/alerts")} variant="ghost">Alertas</Button>
                    </>
                  )}
                  {role === "DOCTOR" && (
                    <>
                      <Button onClick={() => nav("/reports")} colorScheme="blue">Ver reportes</Button>
                      <Button onClick={() => nav("/alerts")} variant="outline">Políticas de alertas</Button>
                    </>
                  )}
                </HStack>
              </CardBody>
            </Card>
            </VStack>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
