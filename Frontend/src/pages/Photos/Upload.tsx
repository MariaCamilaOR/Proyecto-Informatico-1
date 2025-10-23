import { Box, Heading, Text, Flex, VStack, Card, CardBody, Alert, AlertIcon } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { PhotoUploader } from "../../components/PhotoUpload/PhotoUploader";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";

export default function PhotosUpload() {
  const { user } = useAuth();

  const handlePhotoUpload = (files: File[]) => {
    console.log("Fotos subidas:", files);
    // Aquí se implementaría la lógica real de subida
  };

  const canUpload = user && hasPermission(user.role, "upload_photos");

  if (!canUpload) {
    return (
      <Box>
        <Navbar />
        <Flex>
          <Sidebar />
          <Box flex="1" p={6}>
            <Alert status="warning">
              <AlertIcon />
              No tienes permisos para subir fotos con tu rol actual.
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
              <Heading mb={2}>📸 Subir Fotos Familiares</Heading>
              <Text color="gray.600">
                Sube fotos de familia, amigos y lugares importantes para crear tu galería personal.
              </Text>
            </Box>

            <Card>
              <CardBody>
                <VStack spacing={4}>
                  <Box w="full">
                    <Text fontWeight="bold" mb={2}>Instrucciones:</Text>
                    <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
                      <Text>• Selecciona fotos en formato JPG o PNG</Text>
                      <Text>• Cada foto debe ser menor a 5MB</Text>
                      <Text>• Puedes subir hasta 10 fotos a la vez</Text>
                      <Text>• Las fotos se asociarán a tu perfil de paciente</Text>
                    </VStack>
                  </Box>

                  <PhotoUploader 
                    onUpload={handlePhotoUpload}
                    maxFiles={10}
                    maxSizeMB={5}
                    acceptedFormats={["image/jpeg", "image/jpg", "image/png"]}
                  />
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack spacing={3} align="start">
                  <Text fontWeight="bold">💡 Consejos para mejores resultados:</Text>
                  <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
                    <Text>• Sube fotos de personas que conozcas bien</Text>
                    <Text>• Incluye fotos de diferentes épocas de tu vida</Text>
                    <Text>• Agrega fotos de lugares importantes para ti</Text>
                    <Text>• Las fotos más claras y nítidas funcionan mejor</Text>
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