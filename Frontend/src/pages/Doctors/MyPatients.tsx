import React, { useEffect, useState } from "react";
import { Box, Heading, Text, VStack, Card, CardBody, HStack, Button, Avatar, Input, InputGroup, InputRightElement, Grid } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

export default function MyPatients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const nav = useNavigate();

  const loadMyPatients = async (q?: string) => {
    setLoading(true);
    try {
      const url = q ? `/patients?q=${encodeURIComponent(q)}` : `/patients`;
      const resp = await api.get(url);
      const all: any[] = resp.data || [];
      const mine = all.filter((p) => p.assignedDoctorId === user?.uid);
      setPatients(mine);
    } catch (e) {
      console.error("Failed to load my patients", e);
      toast({ title: "Error", description: "No se pudieron cargar tus pacientes.", status: "error", duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadMyPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  return (
    <Box>
      <Navbar />
      <Grid templateColumns={{ base: "1fr" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading>👨‍⚕️ Mis Pacientes</Heading>
              <Text color="gray.600">Aquí verás los pacientes que tienes asignados. Puedes buscarlos por nombre o email.</Text>
            </Box>

            <Box>
              <InputGroup maxW="lg">
                <Input placeholder="Buscar por nombre o email..." value={query} onChange={(e) => setQuery(e.target.value)} />
                <InputRightElement width="6.5rem">
                  <Button h="1.75rem" size="sm" onClick={async () => await loadMyPatients(query.trim() || undefined)}>Buscar</Button>
                </InputRightElement>
              </InputGroup>
            </Box>

            <Box>
              {patients.length === 0 ? (
                <Text>No hay pacientes asignados.</Text>
              ) : (
                <VStack spacing={3} align="stretch">
                  {patients.map((p) => (
                    <Card key={p.id}><CardBody>
                      <HStack justify="space-between">
                        <HStack>
                          <Avatar name={p.displayName || p.id} />
                          <Box>
                            <Text fontWeight="bold">{p.displayName || p.id}</Text>
                            <Text fontSize="sm" color="blue.600">{p.email || '—'}</Text>
                          </Box>
                        </HStack>
                        <HStack>
                          <Button size="sm" colorScheme="blue" onClick={() => nav(`/doctors/patient/${p.id}`)}>Ver Descripciones</Button>
                        </HStack>
                      </HStack>
                    </CardBody></Card>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        </Box>
      </Grid>
    </Box>
  );
}
