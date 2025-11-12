import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import {
  Box,
  Heading,
  Text,
  VStack,
  Card,
  CardBody,
  HStack,
  Avatar,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Checkbox,
  Textarea,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { api } from "../../api";
import { useAuth } from "../../hooks/useAuth";

// ---------- Helpers para mostrar frases humanas ----------
type AnyRec = Record<string, any>;

function safeParse(value: unknown): AnyRec {
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return {}; }
  }
  return (value as AnyRec) || {};
}

function joinWithAnd(list: string[]): string {
  if (list.length <= 1) return list.join("");
  return `${list.slice(0, -1).join(", ")} y ${list[list.length - 1]}`;
}

function humanizeWizardData(raw: unknown): string {
  const d = safeParse(raw);

  const parts: string[] = [];

  if (Array.isArray(d.people) && d.people.length) {
    parts.push(`aparece(n) ${joinWithAnd(d.people.map(String))}`);
  }
  if (Array.isArray(d.places) && d.places.length) {
    parts.push(`en ${joinWithAnd(d.places.map(String))}`);
  }
  if (d.events) {
    parts.push(`durante ${String(d.events)}`);
  }
  if (d.emotions) {
    parts.push(`con emociones de ${String(d.emotions)}`);
  }
  if (d.details) {
    parts.push(String(d.details));
  }

  let sentence = parts.length
    ? `En la foto ${parts.join(", ")}.`
    : "Descripción sin detalles.";

  if (Array.isArray(d.tags) && d.tags.length) {
    sentence += ` Etiquetas: ${joinWithAnd(d.tags.map(String))}.`;
  }
  return sentence;
}

function formatDescription(item: AnyRec): string {
  if (item?.type === "text") return String(item.description || "");
  if (item?.type === "wizard") return humanizeWizardData(item.data);
  // Fallback genérico
  return item?.description ? String(item.description) : "";
}
// ---------------------------------------------------------

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
      const all = resp.data || [];
      const mine = all.filter((p: any) => p.assignedDoctorId === user?.uid);
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
      <HStack spacing={0} align="stretch">
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading mb={2}>👨‍⚕️ Mis Pacientes</Heading>
              <Text color="gray.600">Aquí verás los pacientes que tienes asignados. Puedes buscar y abrir su detalle para ver respuestas a quizzes.</Text>
            </Box>

            <Box>
              <InputGroup maxW="lg">
                <Input placeholder="Buscar por nombre o email..." value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} />
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
                    <Card key={p.id}>
                      <CardBody>
                        <HStack justify="space-between">
                          <HStack>
                            <Avatar name={p.displayName || p.id} />
                            <Box>
                              <Text fontWeight="bold">{p.displayName || p.id}</Text>
                              <Text fontSize="sm" color="blue.600">{p.email || '—'}</Text>
                            </Box>
                          </HStack>
                          <HStack>
                            <Button size="sm" colorScheme="blue" onClick={() => window.location.assign(`/doctors/patient/${p.id}`)}>Ver respuestas</Button>
                          </HStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
}
