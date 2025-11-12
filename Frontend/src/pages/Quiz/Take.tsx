import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Heading, Text, Flex, VStack, HStack, Card, CardBody,
  RadioGroup, Radio, Stack, Button, Progress, useToast, Spinner, Divider
} from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { api } from "../../api";
import { useAuth } from "../../hooks/useAuth";

type Yn = "yes" | "no";
type QuizItem =
  | { id: string; type: "yn"; prompt: string }
  | { id: string; type: "mc"; prompt: string; options?: string[]; correctIndex?: number };

type QuizDoc = {
  id: string;
  patientId: string;
  status: "open" | "completed";
  items: QuizItem[];
  photoId?: string;
  photoUrl?: string;
  createdAt?: any;
  submittedAt?: any;
  score?: number; // 0..1
  classification?: string; // "leve/moderado/severo"
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
  // answers can be:
  // - for yn questions: "yes" | "no"
  // - for mc questions: number (index of selected option)
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const r = await api.get(`/quizzes/${id}`);
      const q: QuizDoc = { id, ...(r.data || {}) };
      setQuiz(q);

      // si el backend devolvió respuestas previas (array), pre-cargarlas en el formato Record
      if (Array.isArray(r.data?.answers)) {
        const arr: any[] = r.data.answers;
        const map: Record<string, string | number> = {};
        for (const a of arr) {
          if (a && a.itemId) {
            if (typeof a.yn === "boolean") map[a.itemId] = a.yn ? "yes" : "no";
            else if (typeof a.answerIndex === "number") map[a.itemId] = a.answerIndex;
          }
        }
        setAnswers(map);
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

  const onChangeAnswer = (itemId: string, value: string | number) => {
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
      // Convertir map de respuestas a array con la forma que espera el backend
      // backend espera: answers: [{ itemId, answerIndex?, yn? }]
      const answersArray = (quiz.items || []).map((it) => {
        const val = answers[it.id];
        if (it.type === "mc") {
          // puede ser number o string que represente un número
          const idx = typeof val === "number" ? val : Number(val);
          return { itemId: it.id, answerIndex: Number.isNaN(idx) ? undefined : idx };
        }
        // yn question
        return { itemId: it.id, yn: val === "yes" };
      });
      const payload = { answers: answersArray };
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

              {quiz.photoUrl && (
                <Card>
                  <CardBody>
                    <VStack spacing={4}>
                      <Text fontWeight="bold">Foto del cuestionario</Text>
                      <Box 
                        maxW="400px" 
                        width="100%" 
                        borderRadius="md" 
                        overflow="hidden"
                        boxShadow="md"
                      >
                        <img 
                          src={quiz.photoUrl} 
                          alt="Foto relacionada con el cuestionario"
                          style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                        />
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              )}

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

                        {it.type === "yn" && (
                          <RadioGroup
                            onChange={(v) => onChangeAnswer(it.id, v as string)}
                            value={(answers[it.id] as string) || ""}
                          >
                            <Stack direction="row" spacing={6}>
                              <Radio value="yes">Sí</Radio>
                              <Radio value="no">No</Radio>
                            </Stack>
                          </RadioGroup>
                        )}

                        {it.type === "mc" && (
                          <RadioGroup
                            onChange={(v) => {
                              // Chakra RadioGroup uses string values; parse to number
                              const n = Number(v);
                              onChangeAnswer(it.id, Number.isNaN(n) ? v : n);
                            }}
                            value={typeof answers[it.id] === "number" ? String(answers[it.id]) : (answers[it.id] as string) || ""}
                          >
                            <Stack direction="column" spacing={3}>
                              {(it.options || []).map((opt, oi) => (
                                <Radio key={oi} value={String(oi)}>{opt}</Radio>
                              ))}
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
