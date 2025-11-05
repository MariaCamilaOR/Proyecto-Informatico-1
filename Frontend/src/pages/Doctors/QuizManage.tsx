// src/pages/Doctors/QuizManage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box, Heading, Text, Flex, VStack, HStack, Button, Card, CardBody,
  Badge, useToast, Spinner, Link, IconButton
} from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { api } from "../../lib/api";
import { CopyIcon, RepeatIcon } from "@chakra-ui/icons";

type QuizRow = {
  id: string;
  status: "open" | "completed";
  createdAt?: any;
  submittedAt?: any;
  score?: number;
  classification?: string;
};

export default function QuizManage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<QuizRow[]>([]);
  const toast = useToast();

  const load = async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      const r = await api.get(`/quizzes/patient/${patientId}`);
      setList(r.data || []);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error cargando quizzes", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [patientId]);

  const handleGenerate = async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      const r = await api.post(`/quizzes/generate`, { patientId });
      toast({ title: "Quiz generado", description: `ID: ${r.data?.id}`, status: "success" });
      await load();
    } catch (e: any) {
      console.error(e);
      toast({ title: "No se pudo generar el quiz", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async (quizId: string) => {
    const url = `${window.location.origin}/quiz/take/${quizId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Enlace copiado", description: url, status: "info" });
    } catch {
      toast({ title: "No se pudo copiar", status: "warning" });
    }
  };

  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <HStack justify="space-between" mb={4}>
            <Box>
              <Heading size="lg" color="blue.700">Administrar Quizzes</Heading>
              <Text color="blue.600">Paciente: {patientId}</Text>
            </Box>
            <Button colorScheme="blue" leftIcon={<RepeatIcon />} onClick={handleGenerate} isLoading={loading}>
              Generar nuevo quiz
            </Button>
          </HStack>

          <Card>
            <CardBody>
              {loading ? (
                <HStack><Spinner /><Text>Cargando…</Text></HStack>
              ) : list.length === 0 ? (
                <Text>No hay quizzes todavía. Genera el primero.</Text>
              ) : (
                <VStack align="stretch" spacing={3}>
                  {list.map((q) => (
                    <Flex key={q.id} align="center" justify="space-between" p={3} bg="gray.50" borderRadius="md">
                      <Box>
                        <HStack>
                          <Text fontWeight="bold">Quiz {q.id.slice(0, 6)}</Text>
                          <Badge colorScheme={q.status === "completed" ? "green" : "yellow"}>
                            {q.status === "completed" ? "Completado" : "Abierto"}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          Creado: {q.createdAt?.toDate ? q.createdAt.toDate().toLocaleString() : ""}
                        </Text>
                        {q.status === "completed" && (
                          <HStack spacing={2} mt={1}>
                            <Badge colorScheme="blue">Score: {Math.round((q.score ?? 0) * 100)}%</Badge>
                            <Badge colorScheme="purple">{q.classification || "-"}</Badge>
                          </HStack>
                        )}
                      </Box>

                      <HStack>
                        <IconButton
                          aria-label="Copiar enlace"
                          icon={<CopyIcon />}
                          onClick={() => copyLink(q.id)}
                        />
                        <Link as={RouterLink} to={`/quiz/take/${q.id}`}>
                          <Button variant="outline" size="sm">Abrir</Button>
                        </Link>
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
