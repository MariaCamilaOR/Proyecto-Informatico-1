import React, { useEffect, useState } from "react";
import {
  Box, Heading, Text, Flex, VStack, HStack, Card, CardBody,
  Badge, Spinner, useToast, Button, Link
} from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { api } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { Link as RouterLink } from "react-router-dom";

type QuizRow = {
  id: string;
  status: "open" | "completed";
  createdAt?: any;
  submittedAt?: any;
  score?: number;          // 0..1
  classification?: string; // leve/moderado/severo
};

function toDate(val: any): string {
  if (!val) return "";
  if (val?.toDate && typeof val.toDate === "function") return val.toDate().toLocaleString();
  const d = new Date(val);
  return isNaN(d.getTime()) ? "" : d.toLocaleString();
}

export default function PatientQuizResults() {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<QuizRow[]>([]);

  const load = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      // Lista de quizzes del paciente autenticado
      const r = await api.get(`/quizzes/patient/${user.uid}`);
      setRows(r.data || []);
    } catch (e: any) {
      console.error(e);
      toast({ title: "No se pudieron cargar los resultados", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.uid]);

  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <Heading mb={2} color="blue.700">Resultados de cuestionarios</Heading>
          <Text color="blue.600" mb={4}>
            Aquí verás tus cuestionarios (abiertos y completados) y su puntaje.
          </Text>

          <Card>
            <CardBody>
              {loading ? (
                <HStack><Spinner /><Text>Cargando…</Text></HStack>
              ) : rows.length === 0 ? (
                <Text>Aún no tienes cuestionarios asignados.</Text>
              ) : (
                <VStack align="stretch" spacing={3}>
                  {rows.map((q) => (
                    <Flex key={q.id} align="center" justify="space-between" p={3} bg="gray.50" borderRadius="md">
                      <Box>
                        <HStack spacing={3}>
                          <Text fontWeight="bold">Quiz {q.id.slice(0, 6)}</Text>
                          <Badge colorScheme={q.status === "completed" ? "green" : "yellow"}>
                            {q.status === "completed" ? "Completado" : "Abierto"}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          Creado: {toDate(q.createdAt)}
                          {q.submittedAt ? ` • Enviado: ${toDate(q.submittedAt)}` : ""}
                        </Text>
                        {q.status === "completed" && (
                          <HStack spacing={2} mt={1}>
                            <Badge colorScheme="blue">Score: {Math.round((q.score ?? 0) * 100)}%</Badge>
                            <Badge colorScheme="purple">{q.classification || "-"}</Badge>
                          </HStack>
                        )}
                      </Box>

                      <HStack>
                        {q.status === "open" ? (
                          <Link as={RouterLink} to={`/quiz/take/${q.id}`}>
                            <Button size="sm" colorScheme="blue">Continuar</Button>
                          </Link>
                        ) : (
                          <Button size="sm" variant="outline" isDisabled>Listo</Button>
                        )}
                      </HStack>
                    </Flex>
                  ))}
                </VStack>
              )}
            </CardBody>
          </Card>
        </Box>
      </Flex>
    </Box>
  );
}
