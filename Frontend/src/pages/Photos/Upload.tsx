import { Box, Heading, Text, Flex, VStack, Card, CardBody, Alert, AlertIcon } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { PhotoGallery } from "../../components/PhotoGallery/PhotoGallery";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { PhotoUploader } from "../../components/PhotoUpload/PhotoUploader";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";

export default function PhotosUpload() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);

  const canUpload =
    !!user && (hasPermission(user.role, "upload_photos") || hasPermission(user.role, "upload_photos_for_patient"));

  const loadPhotos = async () => {
    try {
      const patientId = user?.linkedPatientIds?.[0] || "demo-patient-123";
      const resp = await api.get(`/photos/patient/${patientId}`);
      setPhotos(resp.data || []);
    } catch (e) {
      console.error("loadPhotos error:", (e as any)?.response?.status, (e as any)?.response?.data || (e as any).message || e);
    }
  };

  useEffect(() => {
    loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const handlePhotoUpload = (files: File[]) => {
    const upload = async () => {
      try {
        const form = new FormData();
        files.forEach((f) => form.append("files", f));
        const patientId = user?.linkedPatientIds?.[0] || "demo-patient-123";
        form.append("patientId", patientId);

        await api.post(`/photos/upload`, form);
        await loadPhotos();
      } catch (e) {
        console.error("Upload failed", e);
      }
    };
    upload();
  };

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
              <Text color="gray.600">Sube fotos de familia, amigos y lugares importantes.</Text>
            </Box>

            <Card>
              <CardBody>
                <VStack spacing={4}>
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
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
