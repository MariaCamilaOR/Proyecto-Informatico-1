import { Box, Heading, Text, Flex, VStack, Card, CardBody, Alert, AlertIcon } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getIdToken } from "../../lib/auth";
import { api } from "../../lib/api";
import { PhotoGallery } from "../../components/PhotoGallery/PhotoGallery";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { PhotoUploader } from "../../components/PhotoUpload/PhotoUploader";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";

export default function PhotosUpload() {
  const { user } = useAuth();

  const handlePhotoUpload = (files: File[]) => {
    console.log("Fotos subidas:", files);
    // Implementación: subir archivos al backend que los guardará en Storage + Firestore
    const upload = async () => {
      try {
        const form = new FormData();
        files.forEach((f) => form.append("files", f));
        // For demo users, the frontend uses demo patient id from useAuth
        const patientId = user?.linkedPatientIds?.[0] || "demo-patient-123";
        form.append("patientId", patientId);

        // Use shared axios instance so Authorization header is attached automatically
        const resp = await api.post(`/photos/upload`, form);
        const data = resp.data;
        console.log("Upload result:", data);
        // after successful upload, refresh gallery
        await loadPhotos();
      } catch (e) {
        console.error("Upload failed", e);
      }
    };
    upload();
  };

  const [photos, setPhotos] = useState<any[]>([]);

  const loadPhotos = async () => {
    try {
  const patientId = user?.linkedPatientIds?.[0] || "demo-patient-123";
  const resp = await api.get(`/photos/patient/${patientId}`);
  setPhotos(resp.data || []);
    } catch (e) {
      // Log detailed error info to help debug backend 500 responses
      // axios error has response.data with backend error message
      // eslint-disable-next-line no-console
      console.error("loadPhotos error:", (e as any)?.response?.status, (e as any)?.response?.data || (e as any).message || e);
    }
  };

  useEffect(() => {
    loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
                <Heading size="md" mb={4}>📚 Galería</Heading>
                <PhotoGallery photos={photos} canEdit={false} canDelete={false} />
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