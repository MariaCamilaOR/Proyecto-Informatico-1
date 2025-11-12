import { Box, Flex, VStack, Heading, Text, Select } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { PhotoGallery } from "../../components/PhotoGallery/PhotoGallery";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { api } from "../../api";

export default function PatientGallery() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const patientIds = user?.linkedPatientIds && user.linkedPatientIds.length > 0 ? user.linkedPatientIds : user ? [user.uid] : [];

  useEffect(() => {
    // Initialize selectedPatientId when user becomes available
    if (!selectedPatientId && patientIds.length > 0) {
      setSelectedPatientId(patientIds[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, user]);

  useEffect(() => {
    if (!selectedPatientId) return;
    (async () => {
      try {
        const resp = await api.get(`/photos/patient/${selectedPatientId}`);
        setPhotos(resp.data || []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Failed to load patient gallery", err);
        setPhotos([]);
      }
    })();
  }, [selectedPatientId]);

  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading mb={2}>Galería de Fotos</Heading>
              <Text color="gray.600">Todas las fotos que tus cuidadores han subido para ti.</Text>
            </Box>

            {patientIds.length > 1 && (
              <Box>
                <Text mb={2} fontSize="sm" color="gray.600">Ver fotos de:</Text>
                <Select value={selectedPatientId ?? ""} onChange={(e) => setSelectedPatientId(e.target.value)} maxW="sm">
                  {patientIds.map((pid) => (
                    <option key={pid} value={pid}>{pid}</option>
                  ))}
                </Select>
              </Box>
            )}
            <PhotoGallery photos={photos} canEdit={false} canDelete={false} />
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
