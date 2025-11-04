import { Box, Heading, Text, Flex, VStack, Card, CardBody, Button, Alert, AlertIcon, HStack } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { PhotoTagger } from "../../components/PhotoTagging/PhotoTagger";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { useState } from "react";
import { FaTag } from "react-icons/fa";

type DemoPhoto = {
  id: string;
  url: string;
  tags: any[];
  description?: string;
  dateTaken?: string;
  location?: string;
};

export default function PhotosTag() {
  const { user } = useAuth();
  const [isTaggingActive, setIsTaggingActive] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<DemoPhoto | null>(null);

  const canTag =
    !!user && (hasPermission(user.role, "upload_photos") || hasPermission(user.role, "upload_photos_for_patient"));

  const handleStartTagging = () => {
    setSelectedPhoto({
      id: "demo-photo-tag",
      url: "https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Foto+para+Etiquetar",
      tags: [
        { id: "tag-1", type: "person", value: "María", confidence: 0.9 },
        { id: "tag-2", type: "place", value: "Casa", confidence: 0.8 },
      ],
      description: "Foto de María en casa",
      dateTaken: "2024-01-15",
      location: "Bogotá, Colombia",
    });
    setIsTaggingActive(true);
  };

  const handleSaveMetadata = (metadata: any) => {
    console.log("Metadatos guardados:", metadata);
    setIsTaggingActive(false);
    setSelectedPhoto(null);
  };

  const handleCancelTagging = () => {
    setIsTaggingActive(false);
    setSelectedPhoto(null);
  };

  if (!canTag) {
    return (
      <Box>
        <Navbar />
        <Flex direction={{ base: "column", md: "row" }}>
          <Sidebar />
          <Box flex="1" p={{ base: 4, md: 6 }}>
            <Alert status="warning">
              <AlertIcon />
              No tienes permisos para etiquetar fotos con tu rol actual.
            </Alert>
          </Box>
        </Flex>
      </Box>
    );
  }

  if (isTaggingActive && selectedPhoto) {
    return (
      <Box>
        <Navbar />
        <Flex direction={{ base: "column", md: "row" }}>
          <Sidebar />
          <Box flex="1" p={{ base: 4, md: 6 }}>
            <PhotoTagger photo={selectedPhoto as any} onSave={handleSaveMetadata} onCancel={handleCancelTagging} canEdit />
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
              <Heading mb={2}>🏷️ Etiquetar Fotos</Heading>
              <Text color="gray.600">Organiza tus fotos agregando etiquetas y metadatos.</Text>
            </Box>

            <Card>
              <CardBody>
                <VStack spacing={4}>
                  <Text fontWeight="bold" fontSize="lg">Selecciona una foto para etiquetar:</Text>

                  <Box
                    p={4}
                    border="2px dashed"
                    borderColor="gray.300"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ borderColor: "blue.400" }}
                    onClick={handleStartTagging}
                  >
                    <VStack spacing={2}>
                      <img
                        src="https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Foto+para+Etiquetar"
                        alt="Foto de ejemplo"
                        style={{ width: "100%", maxWidth: "320px", height: 150, objectFit: "cover", borderRadius: "8px" }}
                      />
                      <Text fontSize="sm" color="gray.600">Haz clic para etiquetar esta foto</Text>
                    </VStack>
                  </Box>

                  <Button leftIcon={<FaTag />} colorScheme="blue" size="lg" onClick={handleStartTagging}>
                    🏷️ Iniciar Etiquetado
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
