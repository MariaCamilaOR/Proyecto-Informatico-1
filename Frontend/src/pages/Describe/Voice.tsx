import { Box, Heading, Text, Flex, VStack, Card, CardBody, Image, Alert, AlertIcon } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { VoiceRecorder } from "../../components/VoiceRecording/VoiceRecorder";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { useState } from "react";

export default function DescribeVoice() {
  const { user } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleRecordingComplete = (audioBlob: Blob, duration: number) => {
    console.log("Grabación completada:", { audioBlob, duration });
    // Aquí se implementaría la lógica para guardar el audio
  };

  const canRecord = user && hasPermission(user.role, "describe_photos");

  if (!canRecord) {
    return (
      <Box>
        <Navbar />
        <Flex>
          <Sidebar />
          <Box flex="1" p={6}>
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
      <Flex>
        <Sidebar />
        <Box flex="1" p={6}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading mb={2}>🎤 Describir por Voz</Heading>
              <Text color="gray.600">
                Graba una descripción detallada de la foto seleccionada usando tu voz.
              </Text>
            </Box>

            {/* Selección de foto */}
            <Card>
              <CardBody>
                <VStack spacing={4}>
                  <Text fontWeight="bold">📸 Selecciona una foto para describir:</Text>
                  
                  {/* Demo: Foto de ejemplo */}
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
                      <Text fontSize="sm" color="gray.600">
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

            {/* Grabador de voz */}
            {selectedPhoto && (
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                maxDurationSeconds={300}
                patientId={user?.uid || "demo-patient"}
                photoId={selectedPhoto}
              />
            )}

            {/* Información adicional */}
            <Card>
              <CardBody>
                <VStack spacing={3} align="start">
                  <Text fontWeight="bold">💡 Consejos para una buena descripción:</Text>
                  <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
                    <Text>• Describe quién aparece en la foto</Text>
                    <Text>• Menciona el lugar donde fue tomada</Text>
                    <Text>• Explica qué está pasando en la imagen</Text>
                    <Text>• Recuerda detalles como la ropa, objetos, etc.</Text>
                    <Text>• Habla sobre tus sentimientos o recuerdos</Text>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}