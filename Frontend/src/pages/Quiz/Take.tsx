import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Heading, Text, Flex, VStack, HStack, Card, CardBody,
  RadioGroup, Radio, Stack, Button, Progress, useToast, Spinner, Divider
} from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

type Yn = "yes" | "no";
type QuizItem = {
  id: string;
  type: "yn";              // por ahora solo Yes/No
  prompt: string;         // ej: ¿reconoces a la persona?
};

type QuizDoc = {
  id: string;
  patientId: string;
  status: "open" | "completed";
  items: QuizItem[];
  createdAt?: any;
  submittedAt?: any;
  score?: number;          // 0..1
  classification?: string; // “leve/moderado/severo”
};

function toDate(val: any): Date | null {
  if (!val) return null;
  if (val?.toDate && typeof val.toDate === "function") return val.toDate();
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

export default function QuizTake() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<QuizDoc | null>(null);
  const [answers, setAnswers] = useState<Record<string, Yn>>({});
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const r = await api.get(`/quizzes/${id}`);
      const q: QuizDoc = { id, ...(r.data || {}) };
      setQuiz(q);

      // si el backend devolvió respuestas previas, podríamos pre-cargarlas:
      if ((r.data?.answers) && typeof r.data.answers === "object") {
        setAnswers(r.data.answers as Record<string, Yn>);
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: "No se pudo cargar el quiz", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const total = quiz?.items?.length || 0;
  const answered = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers]
  );
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  const onChangeAnswer = (itemId: string, value: Yn) => {
    setAnswers((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleSubmit = async () => {
    if (!id || !quiz) return;

    // opcional: requerir todas contestadas
    if (Object.keys(answers).length < (quiz.items?.length || 0)) {
      toast({ title: "Responde todas las preguntas", status: "warning" });
      return;
    }

    try {
      setSubmitting(true);
      // endpoint de envío (ajústalo si usaste otro en backend)
      const payload = { answers };
      const r = await api.post(`/quizzes/${id}/submit`, payload);

      const score = r.data?.score ?? r.data?.result?.score;
      const classification = r.data?.classification ?? r.data?.result?.classification;

      toast({
        title: "Respuestas enviadas",
        description:
          typeof score === "number"
            ? `Puntaje: ${Math.round(score * 100)}% (${classification || "-"})`
            : undefined,
        status: "success",
      });

      // redirige al historial del paciente
      nav("/quiz/results");
    } catch (e: any) {
      console.error(e);
      toast({ title: "No se pudo enviar el quiz", status: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          {loading ? (
            <HStack><Spinner /><Text>Cargando…</Text></HStack>
          ) : !quiz ? (
            <Text>No se encontró el quiz.</Text>
          ) : (
            <VStack align="stretch" spacing={6}>
              <Box>
                <Heading color="blue.700">Cuestionario</Heading>
                <Text color="blue.600">
                  {toDate(quiz.createdAt)?.toLocaleString() || ""}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>Progreso</Text>
                <Progress value={progress} />
                <Text fontSize="sm" color="gray.600" mt={1}>
                  {answered} de {total} preguntas
                </Text>
              </Box>

              <VStack align="stretch" spacing={4}>
                {quiz.items.map((it, idx) => (
                  <Card key={it.id || idx}>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text fontWeight="bold">Pregunta {idx + 1}</Text>
                          <Text fontSize="sm" color="gray.500">Tipo: {it.type.toUpperCase()}</Text>
                        </HStack>

                        <Text>{it.prompt}</Text>

                        {/* por ahora solo tipo yes/no */}
                        {it.type === "yn" && (
                          <RadioGroup
                            onChange={(v) => onChangeAnswer(it.id, v as Yn)}
                            value={answers[it.id] || ""}
                          >
                            <Stack direction="row" spacing={6}>
                              <Radio value="yes">Sí</Radio>
                              <Radio value="no">No</Radio>
                            </Stack>
                          </RadioGroup>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>

              <Divider />

              <HStack justify="flex-end">
                <Button
                  colorScheme="blue"
                  onClick={handleSubmit}
                  isLoading={submitting}
                  isDisabled={total === 0}
                >
                  Enviar respuestas
                </Button>
              </HStack>
            </VStack>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
