// src/pages/Doctors/QuizManage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box, Heading, Text, Flex, VStack, HStack, Button, Card, CardBody,
  Badge, useToast, Spinner, Link, IconButton, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
  Image, Checkbox
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
  const [descriptions, setDescriptions] = useState<any[]>([]);
  const [selectedDescId, setSelectedDescId] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const load = async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      const r = await api.get(`/quizzes/patient/${patientId}`);
      setList(r.data || []);
      // load descriptions for this patient (to allow quiz by photo)
      try {
        const d = await api.get(`/descriptions/patient/${patientId}`);
        const items = d.data || [];
        setDescriptions(items);
        if (items.length > 0) setSelectedDescId(items[0].id);
      } catch (err) {
        console.warn("Failed to load descriptions for quiz generation", err);
        setDescriptions([]);
        setSelectedDescId(null);
      }
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
      // If a description is selected, prefer generating quiz for that photoId
      let payload: any = { patientId };
      if (selectedDescId) {
        const desc = descriptions.find((x) => x.id === selectedDescId);
        if (desc && desc.photoId) payload.photoId = desc.photoId;
      }
      const r = await api.post(`/quizzes/generate`, payload);
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
            <HStack>
              {descriptions.length > 0 && (
                <Box width="100%" maxW="600px">
                  <Text fontSize="sm" mb={2} color="gray.600">Seleccionar foto con descripción</Text>
                  <VStack spacing={4} align="stretch">
                    {descriptions.map((d) => (
                      <Box 
                        key={d.id}
                        p={3}
                        borderWidth="1px"
                        borderRadius="md"
                        cursor="pointer"
                        bg={selectedDescId === d.id ? "blue.50" : "white"}
                        onClick={() => setSelectedDescId(d.id)}
                        _hover={{ bg: selectedDescId === d.id ? "blue.50" : "gray.50" }}
                      >
                        <HStack spacing={4} align="start">
                          {d.photoUrl && (
                            <Box boxSize="100px" borderRadius="md" overflow="hidden">
                              <img 
                                src={d.photoUrl} 
                                alt="Foto del paciente"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </Box>
                          )}
                          <VStack align="stretch" flex={1}>
                            <Text fontWeight="bold">
                              {d.title || `Foto ${d.photoId?.slice(0,8)}`}
                            </Text>
                            <Text fontSize="sm" color="gray.600" noOfLines={3}>
                              {d.content || 'Sin descripción'}
                            </Text>
                            {selectedDescId === d.id && (
                              <Badge colorScheme="blue" alignSelf="flex-start">
                                Seleccionada
                              </Badge>
                            )}
                          </VStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
              <Button colorScheme="blue" leftIcon={<RepeatIcon />} onClick={onOpen} isLoading={loading}>
                Generar nuevo quiz
              </Button>
            </HStack>
          </HStack>

          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent maxW="900px">
              <ModalHeader>Seleccionar foto para el cuestionario</ModalHeader>
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  {descriptions.length === 0 ? (
                    <Text color="gray.500">No hay fotos con descripción disponibles</Text>
                  ) : (
                    descriptions.map((desc) => (
                      <Card 
                        key={desc.id}
                        onClick={() => setSelectedDescId(desc.id)}
                        cursor="pointer"
                        bg={selectedDescId === desc.id ? "blue.50" : "white"}
                        _hover={{ bg: selectedDescId === desc.id ? "blue.50" : "gray.50" }}
                      >
                        <CardBody>
                          <HStack spacing={4} align="start">
                            <Box width="200px" height="150px" borderRadius="md" overflow="hidden">
                              {desc.photoUrl ? (
                                <Image
                                  src={desc.photoUrl}
                                  alt="Foto del paciente"
                                  objectFit="cover"
                                  width="100%"
                                  height="100%"
                                />
                              ) : (
                                <Box bg="gray.100" width="100%" height="100%" />
                              )}
                            </Box>
                            <VStack align="stretch" flex={1}>
                              <Text fontWeight="bold">{desc.title || 'Sin título'}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {desc.content || 'Sin descripción'}
                              </Text>
                              {desc.tags?.length > 0 && (
                                <HStack>
                                  {desc.tags.map((tag: string, i: number) => (
                                    <Badge key={i} colorScheme="blue">
                                      {tag}
                                    </Badge>
                                  ))}
                                </HStack>
                              )}
                              {selectedDescId === desc.id && (
                                <Badge colorScheme="green">Seleccionada</Badge>
                              )}
                            </VStack>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={() => {
                    handleGenerate();
                    onClose();
                  }}
                  isDisabled={!selectedDescId}
                >
                  Generar cuestionario
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

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
