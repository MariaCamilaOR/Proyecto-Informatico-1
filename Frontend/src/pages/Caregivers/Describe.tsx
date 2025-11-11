import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Image,
  Flex,
  Text,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  SimpleGrid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";

type Photo = any;

export default function CaregiverDescribePage() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [form, setForm] = useState({ title: "", events: "", people: "", places: "", emotions: "", details: "" });
  const toast = useToast();
  const disclosure = useDisclosure();

  useEffect(() => {
    loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  async function loadPhotos() {
    if (!user) return;
    const linked = Array.isArray(user.linkedPatientIds) ? user.linkedPatientIds : [];
    if (linked.length === 0) {
      setPhotos([]);
      return;
    }
    setLoading(true);
    try {
      // Fetch photos for each linked patient in parallel
      const calls = linked.map((pid: string) => api.get(`/photos/patient/${encodeURIComponent(pid)}`).then((r) => r.data || []).catch(() => []));
      const results = await Promise.all(calls);
      const merged: Photo[] = ([] as Photo[]).concat(...results);
      // normalize createdAt to number for sorting
      merged.forEach((p) => {
        if (p.createdAt && typeof p.createdAt === "string") {
          p._createdAtMs = Date.parse(p.createdAt);
        } else if (p.createdAt && typeof p.createdAt === "number") {
          p._createdAtMs = p.createdAt;
        } else {
          p._createdAtMs = 0;
        }
      });
      merged.sort((a, b) => (b._createdAtMs || 0) - (a._createdAtMs || 0));
      setPhotos(merged);
    } catch (err) {
      console.error("Failed to load caregiver photos", err);
      toast({ title: "Error cargando fotos", status: "error", duration: 4000 });
    } finally {
      setLoading(false);
    }
  }

  function openDescribe(photo: Photo) {
    setSelectedPhoto(photo);
    setForm({ title: "", events: "", people: "", places: "", emotions: "", details: "" });
    disclosure.onOpen();
  }

  async function submitDescribe() {
    if (!selectedPhoto || !user) return;
    const patientId = selectedPhoto.patientId || selectedPhoto.patient; // backend uses patientId
    try {
      await api.post("/descriptions/wizard", {
        patientId,
        photoId: selectedPhoto.id,
        data: {
          title: form.title || null,
          events: form.events || null,
          people: form.people ? form.people.split(",").map((s) => s.trim()).filter(Boolean) : [],
          places: form.places || null,
          emotions: form.emotions || null,
          details: form.details || null,
        },
      });
      toast({ title: "Descripción guardada", status: "success", duration: 3000 });
      disclosure.onClose();
      // update local photo to show it has description
      setPhotos((prev) => prev.map((p) => (p.id === selectedPhoto.id ? { ...p, description: form.details || form.title || p.description } : p)));
    } catch (err: any) {
      console.error("Failed to save description", err);
      toast({ title: "Error guardando descripción", description: (err?.response?.data?.error) || String(err), status: "error", duration: 5000 });
    }
  }

  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <Box className="portal">
            <Heading size="lg" mb={4}>📝 Describir Fotos de Pacientes</Heading>
            <Text mb={4} color="gray.600">Aquí verás las fotos subidas por los pacientes que tienes a cargo; selecciona una y completa la descripción para generar la "respuesta correcta" que luego se usa en los cuestionarios.</Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {photos.map((p) => (
              <Card key={p.id}>
                <CardBody>
                  <HStack align="start">
                    <Box flexShrink={0} w="180px" h="120px" overflow="hidden" borderRadius="md">
                      <Image src={p.url} alt={p.description || p.id} objectFit="cover" w="100%" h="100%" />
                    </Box>
                    <VStack align="start" spacing={2} flex="1">
                      <Text fontWeight="bold">{p.title || (p.description ? (String(p.description).slice(0, 60)) : `Foto ${p.id?.slice?.(0,8)}`)}</Text>
                      <Text fontSize="sm" color="gray.500">Paciente: {p.patientId}</Text>
                      <Text fontSize="sm" color="gray.500">Fecha: {p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}</Text>
                      {p.description ? (
                        <Text fontSize="sm" color="green.700">Descripción registrada</Text>
                      ) : (
                        <Text fontSize="sm" color="orange.600">Sin descripción</Text>
                      )}
                      <HStack>
                        <Button size="sm" colorScheme="blue" onClick={() => openDescribe(p)}>Describir</Button>
                        <Button size="sm" variant="outline" onClick={() => window.open(p.url, "_blank")}>Abrir imagen</Button>
                      </HStack>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
            </SimpleGrid>

          {/* Modal para describir */}
          <Modal isOpen={disclosure.isOpen} onClose={disclosure.onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Describir foto</ModalHeader>
              <ModalBody>
                <VStack spacing={3} align="stretch">
                  <FormControl>
                    <FormLabel>Título</FormLabel>
                    <Input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Evento</FormLabel>
                    <Input value={form.events} onChange={(e) => setForm((s) => ({ ...s, events: e.target.value }))} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Personas (separadas por coma)</FormLabel>
                    <Input value={form.people} onChange={(e) => setForm((s) => ({ ...s, people: e.target.value }))} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Lugar</FormLabel>
                    <Input value={form.places} onChange={(e) => setForm((s) => ({ ...s, places: e.target.value }))} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Emociones</FormLabel>
                    <Input value={form.emotions} onChange={(e) => setForm((s) => ({ ...s, emotions: e.target.value }))} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Detalles (resumen)</FormLabel>
                    <Textarea rows={4} value={form.details} onChange={(e) => setForm((s) => ({ ...s, details: e.target.value }))} />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button mr={3} onClick={disclosure.onClose}>Cancelar</Button>
                <Button colorScheme="blue" onClick={submitDescribe}>Guardar descripción</Button>
              </ModalFooter>
            </ModalContent>
            </Modal>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
