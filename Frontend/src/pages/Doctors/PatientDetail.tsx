import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  Checkbox,
  Textarea,
  useToast,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Tag,
  Badge,
} from "@chakra-ui/react";
import { api } from "../../api";
import { useAuth } from "../../hooks/useAuth";

// ------------ Helpers de formateo ------------
const normalizeToList = (val: any): string[] => {
  if (val == null) return [];
  if (Array.isArray(val)) {
    return val.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof val === "object") {
    return Object.values(val)
      .flatMap((v) => normalizeToList(v))
      .filter(Boolean);
  }

  let s = String(val).trim();
  if (!s) return [];

  try {
    const parsed = JSON.parse(s);
    return normalizeToList(parsed);
  } catch {
    s = s.replace(/[{}\[\]"]/g, "");
    return s
      .split(/[,;\n]/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
};

const quoteList = (arr: string[]) => arr.map((x) => `"${x}"`).join(", ");

const formatDescriptionData = (data: any): string => {
  if (!data) return "";
  const people = normalizeToList(data.people);
  const places = normalizeToList(data.places);
  const events = normalizeToList(data.events);
  const emotions = normalizeToList(data.emotions);
  const tags = normalizeToList(data.tags);
  const details = (data.details ?? "").toString().trim();

  const parts: string[] = [];
  if (people.length) parts.push(`foto de ${quoteList(people)}`);
  if (places.length) parts.push(`en ${quoteList(places)}`);
  if (events.length) parts.push(`durante ${quoteList(events)}`);
  if (emotions.length) parts.push(`emociones ${quoteList(emotions)}`);
  if (details) parts.push(`detalles: "${details}"`);
  if (tags.length)
    parts.push(
      `tags: ${tags.map((t) => `#${t.replace(/\s+/g, "_")}`).join(", ")}`
    );

  return parts.join(", ");
};

const formatDescription = (d: any): string => {
  if (!d) return "";
  if (d.type === "text") return (d.description ?? "").toString().trim();
  return formatDescriptionData(d.data);
};
// ------------ /Helpers ------------

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [patient, setPatient] = useState<any | null>(null);
  const [descriptions, setDescriptions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [baseline, setBaseline] = useState("");
  const [message, setMessage] = useState("");
  const toast = useToast();

  const load = async () => {
    if (!id) return;
    try {
      const p = await api.get(`/patients/${id}`);
      setPatient(p.data);
    } catch (e) {
      console.error("Failed to load patient", e);
    }
    try {
      const d = await api.get(`/descriptions/patient/${id}`);
      setDescriptions(d.data || []);
    } catch (e) {
      console.error("Failed to load descriptions", e);
    }
    try {
      const r = await api.get(`/reports/patient/${id}`);
      setReports(r.data || []);
    } catch (e) {
      console.error("Failed to load reports", e);
    }
    try {
      const q = await api.get(`/quizzes/patient/${id}`);
      setQuizzes(q.data || []);
    } catch (e) {
      console.error("Failed to load quizzes", e);
    }
  };

  const openQuizDetail = async (quizId: string) => {
    try {
      setQuizLoading(true);
      const r = await api.get(`/quizzes/${quizId}`);
      setSelectedQuiz(r.data || null);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to load quiz detail", err);
      toast({ title: "Error", description: "No se pudo cargar el quiz.", status: "error" });
    } finally {
      setQuizLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQuiz(null);
  };

  useEffect(() => {
    load();
  }, [id]);

  const toggle = (descId: string) =>
    setSelected((s) => ({ ...s, [descId]: !s[descId] }));

  const handleCreateReport = async () => {
    if (!id) return;
    const selectedList = descriptions.filter((d) => selected[d.id]);
    if (selectedList.length === 0 && !baseline) {
      toast({
        title: "Nada seleccionado",
        description:
          "Selecciona al menos una descripción o escribe una línea base.",
        status: "warning",
      });
      return;
    }

    try {
      const payload = {
        patientId: id,
        data: { descriptions: selectedList, createdBy: user?.uid },
        baseline,
      };
      await api.post(`/reports`, payload);
      toast({ title: "Reporte creado", status: "success" });
      const r = await api.get(`/reports/patient/${id}`);
      setReports(r.data || []);
    } catch (e) {
      console.error("Failed to create report", e);
      toast({
        title: "Error",
        description: "No se pudo crear el reporte.",
        status: "error",
      });
    }
  };

  const handleRequestBaseline = async () => {
    if (!id) return;
    try {
      await api.post(`/notifications`, {
        patientId: id,
        type: "baseline_request",
        message,
      });
      toast({
        title: "Solicitud enviada",
        description:
          "Se solicitó al paciente que establezca una línea base.",
        status: "success",
      });
      setMessage("");
    } catch (e) {
      console.error("Failed to send notification", e);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud.",
        status: "error",
      });
    }
  };

  return (
    <Box>
      <Navbar />
      <HStack spacing={0} align="stretch">
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <VStack align="stretch" spacing={6}>
            <Heading>
              Paciente: {patient?.displayName || patient?.email || id}
            </Heading>

            <Card>
              <CardBody>
                <Heading size="sm">Descripciones del paciente</Heading>
                <Text fontSize="sm" color="gray.600">
                  Selecciona las descripciones que quieras incluir en un
                  reporte.
                </Text>
                <VStack align="stretch" mt={3}>
                  {descriptions.length === 0 ? (
                    <Text>No hay descripciones.</Text>
                  ) : (
                    descriptions.map((d) => (
                      <Card key={d.id}>
                        <CardBody>
                          <HStack align="start" justify="space-between">
                            <HStack>
                              <Avatar
                                name={d.authorUid || "Paciente"}
                                size="sm"
                              />
                              <Box>
                                <Text fontWeight="bold">
                                  {d.type || "descripcion"}
                                </Text>
                                <Text fontSize="sm">
                                  {formatDescription(d) || "(sin detalles)"}
                                </Text>
                              </Box>
                            </HStack>
                            <Checkbox
                              isChecked={!!selected[d.id]}
                              onChange={() => toggle(d.id)}
                            >
                              Incluir
                            </Checkbox>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </VStack>

                <Divider my={4} />
                <Heading size="sm">Crear Reporte</Heading>
                <Text fontSize="sm" color="gray.600">
                  Puedes incluir las descripciones seleccionadas y/o una línea
                  base.
                </Text>
                <Textarea
                  mt={2}
                  placeholder="Línea base (opcional)"
                  value={baseline}
                  onChange={(e) => setBaseline(e.target.value)}
                />
                <HStack justify="flex-end" mt={3}>
                  <Button colorScheme="green" onClick={handleCreateReport}>
                    Crear Reporte
                  </Button>
                </HStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Heading size="sm">Solicitar Línea Base</Heading>
                <Text fontSize="sm" color="gray.600">
                  Envía una solicitud al paciente para que complete una línea
                  base que puedas usar en futuros reportes.
                </Text>
                <Textarea
                  mt={2}
                  placeholder="Mensaje al paciente (opcional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <HStack justify="flex-end" mt={3}>
                  <Button colorScheme="blue" onClick={handleRequestBaseline}>
                    Solicitar Línea Base
                  </Button>
                </HStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Heading size="sm">Reportes previos</Heading>
                {reports.length === 0 ? (
                  <Text>No hay reportes.</Text>
                ) : (
                  <VStack align="stretch">
                    {reports.map((r) => (
                      <Card key={r.id}>
                        <CardBody>
                          <Text fontWeight="bold">
                            {new Date(
                              r.createdAt?.toDate
                                ? r.createdAt.toDate()
                                : r.createdAt
                            ).toLocaleString()}
                          </Text>

                          {r.baseline ? (
                            <Text fontSize="sm" mt={1}>
                              <b>Línea base:</b> {r.baseline}
                            </Text>
                          ) : null}

                          {Array.isArray(r.data?.descriptions) &&
                          r.data.descriptions.length > 0 ? (
                            <VStack align="stretch" mt={2} spacing={1}>
                              {r.data.descriptions.map((dd: any) => (
                                <Text key={dd.id} fontSize="sm">
                                  • {formatDescription(dd) || "(sin detalles)"}
                                </Text>
                              ))}
                            </VStack>
                          ) : (
                            <Text fontSize="sm" mt={2}>
                              (sin descripciones)
                            </Text>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <HStack justify="space-between" mb={4}>
                  <Box>
                    <Heading size="sm">Cuestionarios</Heading>
                    <Text fontSize="sm" color="gray.600">Lista de quizzes generados para este paciente.</Text>
                  </Box>
                  <Button 
                    colorScheme="blue" 
                    onClick={() => window.location.href = `/doctors/patient/${id}/quiz`}
                  >
                    Generar nuevo cuestionario
                  </Button>
                </HStack>
                <VStack align="stretch" mt={3}>
                  {quizzes.length === 0 ? (
                    <Text>No hay cuestionarios.</Text>
                  ) : (
                    quizzes.map((q) => (
                      <Card key={q.id}>
                        <CardBody>
                          <HStack justify="space-between">
                            <Box>
                              <Text fontWeight="bold">Quiz {String(q.id).slice(0,6)}</Text>
                              <Text fontSize="sm" color="gray.600">Creado: {q.createdAt?.toDate ? q.createdAt.toDate().toLocaleString() : (q.createdAt || "")}</Text>
                              {q.status === "completed" && (
                                <HStack spacing={2} mt={1}>
                                  <Text fontSize="sm">Puntaje: {Math.round((q.score ?? 0) * 100)}%</Text>
                                  <Text fontSize="sm">Clasificación: {q.classification || "-"}</Text>
                                </HStack>
                              )}
                            </Box>
                            <HStack>
                              <Button size="sm" variant="outline" onClick={() => window.open(`${window.location.origin}/quiz/take/${q.id}`, "_blank")}>Abrir</Button>
                              <Button size="sm" colorScheme="blue" onClick={() => openQuizDetail(q.id)}>Ver respuestas</Button>
                            </HStack>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </VStack>
              </CardBody>
            </Card>
            {/* Modal para ver detalle de un quiz */}
            <Modal isOpen={isModalOpen} onClose={closeModal} size="lg">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Detalle del Quiz</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {!selectedQuiz ? (
                    <Text>Cargando…</Text>
                  ) : (
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <Box>
                          <Text fontWeight="bold">ID: {selectedQuiz.id}</Text>
                          <Text fontSize="sm" color="gray.600">Estado: {selectedQuiz.status}</Text>
                        </Box>
                        <Box>
                          {selectedQuiz.status === 'completed' && (
                            <HStack spacing={2}>
                              <Badge colorScheme="blue">{Math.round((selectedQuiz.score ?? 0) * 100)}%</Badge>
                              <Tag>{selectedQuiz.classification || '-'}</Tag>
                            </HStack>
                          )}
                        </Box>
                      </HStack>

                      {Array.isArray(selectedQuiz.items) && selectedQuiz.items.length > 0 ? (
                        selectedQuiz.items.map((it: any, idx: number) => {
                          const ans = Array.isArray(selectedQuiz.answers)
                            ? selectedQuiz.answers.find((a: any) => a.itemId === it.id)
                            : undefined;
                          return (
                            <Card key={it.id || idx}>
                              <CardBody>
                                <Text fontWeight="bold">Pregunta {idx + 1}</Text>
                                <Text mt={2}>{it.prompt}</Text>
                                {it.type === 'yn' && (
                                  <Text mt={2}>Respuesta del paciente: {ans?.yn === true ? 'Sí' : ans?.yn === false ? 'No' : '—'}</Text>
                                )}
                                {it.type === 'mc' && (
                                  <VStack align="stretch" mt={2}>
                                    {(it.options || []).map((opt: string, oi: number) => {
                                      const selected = typeof ans?.answerIndex === 'number' && ans.answerIndex === oi;
                                      const correct = typeof it.correctIndex === 'number' && it.correctIndex === oi;
                                      return (
                                        <HStack key={oi} spacing={3}>
                                          <Text>{opt}</Text>
                                          {selected && <Tag colorScheme="green">Seleccionado</Tag>}
                                          {correct && <Tag colorScheme="purple">Correcto</Tag>}
                                        </HStack>
                                      );
                                    })}
                                  </VStack>
                                )}
                              </CardBody>
                            </Card>
                          );
                        })
                      ) : (
                        <Text>No hay preguntas en este quiz.</Text>
                      )}
                    </VStack>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button onClick={closeModal}>Cerrar</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
}
