import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  Card,
  CardBody,
  Image,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { VoiceRecorder } from "../../components/VoiceRecording/VoiceRecorder";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { api } from "../../lib/api";

export default function DescribeVoice() {
  const { user } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const canRecord = !!user && hasPermission(user.role, "describe_photos");

  const handleRecordingComplete = async (audioBlob: Blob, duration: number) => {
    try {
      // Subir audio (demo de endpoint)
      const form = new FormData();
      form.append("audio", audioBlob, "descripcion.webm");
      form.append("duration", String(duration));
      form.append("photoId", selectedPhoto || "");
      form.append("patientId", user?.linkedPatientIds?.[0] || user?.uid || "demo-patient");
      await api.post("/descriptions/voice", form);
      // eslint-disable-next-line no-console
      console.log("Grabación enviada", { duration });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error subiendo audio", e);
    }
  };

  if (!canRecord) {
    return (
      <Box>
        <Navbar />
        <Flex direction={{ base: "column", md: "row" }}>
          <Sidebar />
          <Box flex="1" p={{ base: 4, md: 6 }}>
            <Alert status="warning">
              <AlertIcon />
              No tienes permisos para grabar descripciones con tu rol actual.
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
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading color="whiteAlpha.900" mb={2}>
                🎤 Describir por Voz
              </Heading>
              <Text color="blue.600">
                Graba una descripción detallada de la foto seleccionada usando tu voz.
              </Text>
            </Box>

            <Card>
              <CardBody>
                <VStack spacing={4}>
                  <Text fontWeight="bold">📸 Selecciona una foto para describir:</Text>

                  <Box
                    p={4}
                    border="2px dashed"
                    borderColor="gray.300"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ borderColor: "blue.400" }}
                    onClick={() => setSelectedPhoto("demo-photo-1")}
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
                        Haz clic para seleccionar esta foto
                      </Text>
                    </VStack>
                  </Box>

                  {selectedPhoto && (
                    <Alert status="success">
                      <AlertIcon />
                      Foto seleccionada. Ahora puedes grabar tu descripción.
                    </Alert>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {selectedPhoto && (
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                maxDurationSeconds={300}
                patientId={user?.linkedPatientIds?.[0] || user?.uid || "demo-patient"}
                photoId={selectedPhoto}
              />
            )}
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
