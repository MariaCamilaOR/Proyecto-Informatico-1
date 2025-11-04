import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  HStack,
  Card,
  CardBody,
  Button,
  Alert,
  AlertIcon,
  Image,
  IconButton,
} from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { DescriptionWizard } from "../../components/PhotoDescription/DescriptionWizard";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { FaPlay } from "react-icons/fa";
import { api } from "../../lib/api";
import { useToast } from "@chakra-ui/react";

type WizardPhoto = {
  id: string;
  url: string;
  patientId: string;
};

export default function DescribeWizard() {
  const { user } = useAuth();
  const [isWizardActive, setIsWizardActive] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<WizardPhoto | null>(null);
  const toast = useToast();
  const [photos, setPhotos] = useState<WizardPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const canDescribe = !!user && hasPermission(user.role, "describe_photos");

  const handleStartWizard = () => {
    // default to first uploaded photo if available
    const p = photos.length > 0 ? photos[0] : {
      id: "demo-photo-wizard",
      url: "https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Foto+de+Familia+Demo",
      patientId: user?.linkedPatientIds?.[0] || user?.uid || "demo-patient",
    };
    setSelectedPhoto(p);
    setIsWizardActive(true);
  };

  // Load user's photos for selection
  useEffect(() => {
    (async () => {
      try {
        if (!user) return;
        const patientId = user.linkedPatientIds?.[0] || user.uid || "demo-patient";
        const resp = await api.get(`/photos/patient/${patientId}`);
        const items: WizardPhoto[] = (resp.data || []).map((it: any) => ({ id: it.id, url: it.url, patientId: it.patientId }));
        setPhotos(items);
        setCurrentIndex(0);
      } catch (err) {
        // ignore — user may not have photos yet
        // eslint-disable-next-line no-console
        console.warn("Failed to load photos for wizard selection", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // keyboard navigation for convenience
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!photos || photos.length === 0) return;
      if (e.key === "ArrowLeft") setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
      if (e.key === "ArrowRight") setCurrentIndex((i) => (i + 1) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photos]);

  const handleWizardComplete = (data: any) => {
    (async () => {
      try {
        const patientId = user?.linkedPatientIds?.[0] || user?.uid || "demo-patient";
        await api.post("/descriptions/wizard", { patientId, photoId: selectedPhoto?.id, data });
        toast({ title: "Descripción guardada", status: "success", duration: 3000 });
      } catch (err: any) {
        console.error("Failed to save wizard description", err);
        toast({ title: "Error al guardar", description: err?.response?.data?.error || err?.message || String(err), status: "error", duration: 4000 });
      } finally {
        setIsWizardActive(false);
        setSelectedPhoto(null);
      }
    })();
  };

  const handleWizardCancel = () => {
    setIsWizardActive(false);
    setSelectedPhoto(null);
  };

  if (!canDescribe) {
    return (
      <Box>
        <Navbar />
        <Flex direction={{ base: "column", md: "row" }}>
          <Sidebar />
          <Box flex="1" p={{ base: 4, md: 6 }}>
            <Alert status="warning">
              <AlertIcon />
              No tienes permisos para describir fotos con tu rol actual.
            </Alert>
          </Box>
        </Flex>
      </Box>
    );
  }

  if (isWizardActive && selectedPhoto) {
    return (
      <Box>
        <Navbar />
        <Flex direction={{ base: "column", md: "row" }}>
          <Sidebar />
          <Box flex="1" p={{ base: 4, md: 6 }}>
            <DescriptionWizard
              photo={selectedPhoto}
              onComplete={handleWizardComplete}
              onCancel={handleWizardCancel}
            />
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading color="whiteAlpha.900" mb={2}>
                🧙‍♂️ Asistente de Descripción
              </Heading>
              <Text color="blue.600">
                Te guiaremos paso a paso para describir tus fotos de manera detallada.
              </Text>
            </Box>

            <Card>
              <CardBody>
                <VStack spacing={4}>
                  <Text fontWeight="bold" fontSize="lg">
                    ¿Cómo funciona el asistente?
                  </Text>

                  <VStack spacing={3} align="start" w="full">
                    <Text fontSize="sm" color="blue.600">
                      <strong>Paso 1:</strong> Identifica las personas en la foto
                    </Text>
                    <Text fontSize="sm" color="blue.600">
                      <strong>Paso 2:</strong> Menciona los lugares donde fue tomada
                    </Text>
                    <Text fontSize="sm" color="blue.600">
                      <strong>Paso 3:</strong> Describe el evento o situación
                    </Text>
                    <Text fontSize="sm" color="blue.600">
                      <strong>Paso 4:</strong> Comparte tus emociones y recuerdos
                    </Text>
                    <Text fontSize="sm" color="blue.600">
                      <strong>Paso 5:</strong> Agrega detalles adicionales
                    </Text>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack spacing={4}>
                  <Text fontWeight="bold">📸 Selecciona una foto para describir:</Text>

                  {photos.length > 0 ? (
                    <VStack spacing={3} w="full" align="center">
                      <Text fontSize="sm" color="gray.600">Elige una foto subida por ti:</Text>
                      <VStack spacing={3} align="center">
                        <HStack spacing={4} align="center">
                          <IconButton aria-label="Anterior" icon={<span>◀</span>} onClick={() => setCurrentIndex((i) => (i - 1 + photos.length) % photos.length)} />
                          <Box>
                            <Image src={photos[currentIndex].url} alt={`Foto ${photos[currentIndex].id}`} maxW="640px" w="100%" objectFit="cover" borderRadius="md" />
                            <Text fontSize="xs" color="gray.500" mt={2}>ID: {photos[currentIndex].id}</Text>
                          </Box>
                          <IconButton aria-label="Siguiente" icon={<span>▶</span>} onClick={() => setCurrentIndex((i) => (i + 1) % photos.length)} />
                        </HStack>

                        {/* position indicator */}
                        <Text fontSize="sm" color="gray.600">{currentIndex + 1} / {photos.length}</Text>

                        {/* thumbnails strip */}
                        <HStack spacing={2} overflowX="auto" w="full" px={2} py={1}>
                          {photos.map((tp, idx) => (
                            <Box key={tp.id} borderRadius="md" cursor="pointer" border={idx === currentIndex ? '2px solid' : '1px solid'} borderColor={idx === currentIndex ? 'blue.300' : 'transparent'} p={1} onClick={() => setCurrentIndex(idx)}>
                              <Image src={tp.url} alt={`thumb-${tp.id}`} boxSize="80px" objectFit="cover" borderRadius="sm" />
                            </Box>
                          ))}
                        </HStack>

                        <Button mt={3} colorScheme="blue" onClick={() => { setSelectedPhoto(photos[currentIndex]); setIsWizardActive(true); }}>Describir esta foto</Button>
                      </VStack>
                    </VStack>
                  ) : (
                    <Box
                      p={4}
                      border="2px dashed"
                      borderColor="gray.300"
                      borderRadius="md"
                      cursor="pointer"
                      _hover={{ borderColor: "blue.400" }}
                      onClick={handleStartWizard}
                    >
                      <VStack spacing={2}>
                        <Image
                          src="https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Foto+de+Familia"
                          alt="Foto de ejemplo"
                          boxSize="200px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                        <Text fontSize="sm" color="blue.600">
                          Haz clic para describir esta foto
                        </Text>
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
