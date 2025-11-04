import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Textarea,
  Input,
  Button,
  Alert,
  AlertIcon,
  useToast,
} from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { api } from "../../lib/api";

export default function DescribeText() {
  const { user } = useAuth();
  const toast = useToast();

  const canDescribe = !!user && hasPermission(user.role, "describe_photos");

  const [form, setForm] = useState({
    photoId: "",
    title: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.photoId || !form.description) {
      toast({ title: "Completa los campos requeridos", status: "warning" });
      return;
    }
    try {
      setSaving(true);
      const patientId = user?.linkedPatientIds?.[0] || user?.uid || "demo-patient";
      await api.post("/descriptions/text", {
        patientId,
        photoId: form.photoId,
        title: form.title || "Descripción",
        description: form.description,
      });
      toast({ title: "Descripción guardada", status: "success" });
      setForm({ photoId: "", title: "", description: "" });
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("save text description", err);
      toast({
        title: "No se pudo guardar",
        description:
          err?.response?.data?.error || err?.message || "Intenta nuevamente",
        status: "error",
      });
    } finally {
      setSaving(false);
    }
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
              No tienes permisos para describir fotos por texto con tu rol actual.
            </Alert>
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
          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading color="whiteAlpha.900" mb={2}>
                Describir por Texto
              </Heading>
              <Text color="gray.300">
                Escribe una descripción detallada para una foto específica.
              </Text>
            </Box>

            <Card>
              <CardBody as="form" onSubmit={onSubmit}>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>ID de la foto</FormLabel>
                    <Input
                      placeholder="Ej: photo-abc123"
                      value={form.photoId}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, photoId: e.target.value }))
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Título (opcional)</FormLabel>
                    <Input
                      placeholder="Ej: Cumpleaños de mamá"
                      value={form.title}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, title: e.target.value }))
                      }
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Descripción</FormLabel>
                    <Textarea
                      rows={6}
                      placeholder="¿Quién aparece? ¿Dónde están? ¿Qué sucede? ¿Qué recuerdas o sientes al verla?"
                      value={form.description}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, description: e.target.value }))
                      }
                    />
                  </FormControl>

                  <Button type="submit" colorScheme="blue" isLoading={saving}>
                    Guardar descripción
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
