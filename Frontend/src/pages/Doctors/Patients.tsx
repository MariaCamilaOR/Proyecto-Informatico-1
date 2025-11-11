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
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { useEffect, useState, useRef } from "react";
import { api } from "../../api";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function DoctorsPatients() {
  const { user } = useAuth();

  const canViewPatients = user && hasPermission(user.role, "view_patient_reports");

  const [patients, setPatients] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const nav = useNavigate();

  const loadPatients = async (q?: string) => {
    setLoading(true);
    try {
      const url = q ? `/patients?q=${encodeURIComponent(q)}` : `/patients`;
      const resp = await api.get(url);
      setPatients(resp.data || []);
    } catch (e) {
      console.error("Failed to load patients", e);
      toast({ title: "Error", description: "No se pudieron cargar los pacientes.", status: "error", duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  

  useEffect(() => {
    if (canViewPatients) {
      loadPatients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Debounce search: trigger loadPatients 500ms after user stops typing
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    const q = searchQuery.trim();
    if (!q) {
      // empty query -> load full list immediately
      loadPatients();
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadPatients(q);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Polling for live updates every 10 seconds
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!canViewPatients) return;

    // start polling
    pollIntervalRef.current = setInterval(() => {
      loadPatients(searchQuery.trim() || undefined);
    }, 10000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewPatients, user?.uid]);

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

  const handleAssign = async (patientId: string) => {
    try {
      await api.post(`/patients/${patientId}/assign-doctor`);
      toast({ title: "Asignado", description: "Paciente asignado a tu lista.", status: "success", duration: 3000 });
      await loadPatients();
    } catch (err: any) {
      console.error("Assign doctor failed", err);
      const status = err?.response?.status;
      if (status === 409) toast({ title: "No disponible", description: "El paciente ya está asignado a otro doctor.", status: "warning", duration: 4000 });
      else toast({ title: "Error", description: "No se pudo asignar al paciente.", status: "error", duration: 4000 });
    }
  };

  const handleUnassign = async (patientId: string) => {
    try {
      await api.post(`/patients/${patientId}/unassign-doctor`);
      toast({ title: "Desasignado", description: "Paciente removido de tu lista.", status: "success", duration: 3000 });
      await loadPatients();
    } catch (err: any) {
      console.error("Unassign doctor failed", err);
      toast({ title: "Error", description: "No se pudo desasignar al paciente.", status: "error", duration: 4000 });
    }
  };

  const doctorName = user?.displayName || user?.email || "usted";

  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading mb={2}>👨‍⚕️ Pacientes</Heading>
              <Text color="blue.600">Listado de pacientes registrados. Selecciona los pacientes que quieras tomar a tu cargo.</Text>
            </Box>

            {/* Search input */}
            <Box>
              <InputGroup maxW="lg">
                <Input placeholder="Buscar pacientes por email (parcial, no sensible a mayúsculas)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <InputRightElement width="6.5rem">
                  <Button h="1.75rem" size="sm" onClick={async () => { await loadPatients(searchQuery.trim() || undefined); }}>Buscar</Button>
                </InputRightElement>
              </InputGroup>
            </Box>

            {/* Single column: show all/available patients */}
            <Grid templateColumns={{ base: "1fr" }} gap={6}>
              <GridItem>
                <Card>
                  <CardBody>
                    <Heading size="sm" mb={3}>Todos los pacientes</Heading>
                    {patients.length === 0 ? (
                      <Text>No hay pacientes registrados.</Text>
                    ) : (
                      <VStack spacing={3} align="stretch">
                        {patients.map((patient) => (
                          <Card key={patient.id}><CardBody>
                            <HStack justify="space-between">
                              <HStack>
                                <Avatar name={patient.displayName || patient.id} />
                                <Box>
                                  <Text fontWeight="bold">{patient.displayName || patient.id}</Text>
                                  <Text fontSize="sm" color="blue.600">{patient.email || '—'}</Text>
                                </Box>
                              </HStack>
                              <HStack>
                                <Button size="sm" onClick={() => nav(`/doctors/patient/${patient.id}`)}>Ver</Button>
                                {patient.assignedDoctorId ? (
                                  patient.assignedDoctorId === user?.uid ? (
                                    <Button size="sm" colorScheme="red" onClick={() => handleUnassign(patient.id)}>Desasignarme</Button>
                                  ) : (
                                    <Button size="sm" colorScheme="gray" isDisabled>Asignado a otro</Button>
                                  )
                                ) : (
                                  <Button size="sm" colorScheme="green" onClick={() => handleAssign(patient.id)}>Asignarme</Button>
                                )}
                              </HStack>
                            </HStack>
                          </CardBody></Card>
                        ))}
                      </VStack>
                    )}
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
