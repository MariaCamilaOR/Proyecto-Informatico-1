import { Box, Heading, Text, Flex, VStack, HStack, Button, Badge, useToast } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { PhotoGallery } from "../../components/PhotoGallery/PhotoGallery";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { FaPlus, FaFilter } from "react-icons/fa";
import { useState, useEffect } from "react";
import { api } from "../../lib/api";

export default function PhotosList() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const toast = useToast();

  const loadPhotos = async () => {
    try {
      const patientId = user?.linkedPatientIds?.[0] || "demo-patient-123";
      const resp = await api.get(`/photos/patient/${patientId}`);
      setPhotos(resp.data || []);
    } catch (e) {
      console.error("PhotosList loadPhotos error:", (e as any)?.response?.status, (e as any)?.response?.data || (e as any).message || e);
    }
  };

  useEffect(() => {
    loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const canViewPhotos = !!user && hasPermission(user.role, "view_own_photos");
  const canEditPhotos = !!user && hasPermission(user.role, "upload_photos");

  const handleEditPhoto = (photo: any) => {
    toast({
      title: "Editar foto",
      description: `Editando foto ${photo.id}`,
      status: "info",
      duration: 2000,
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    (async () => {
      try {
        await api.delete(`/photos/${photoId}`);
        toast({
          title: "Foto eliminada",
          description: `Se eliminó la foto ${photoId}`,
          status: "success",
          duration: 2000,
        });
        // recargar lista
        loadPhotos();
      } catch (e) {
        console.error("delete photo error", e);
        toast({
          title: "Error",
          description: `No se pudo eliminar la foto: ${(e as any)?.response?.data?.error || (e as any).message || e}`,
          status: "error",
          duration: 4000,
        });
      }
    })();
  };

  const handleTagPhoto = (photo: any) => {
    toast({
      title: "Etiquetar foto",
      description: `Etiquetando foto ${photo.id}`,
      status: "info",
      duration: 2000,
    });
  };

  if (!canViewPhotos) {
    return (
      <Box>
        <Navbar />
        <Flex>
          <Sidebar />
          <Box flex="1" p={6}>
            <Text>No tienes permisos para ver fotos con tu rol actual.</Text>
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
            {/* Header */}
            <Flex justify="space-between" align="center">
              <Box>
                <Heading mb={2}>📸 Galería de Fotos</Heading>
                <Text color="gray.600">
                  Tus fotos familiares y recuerdos importantes
                </Text>
              </Box>
              <HStack spacing={3}>
                <Button
                  leftIcon={<FaFilter />}
                  variant="outline"
                  size="sm"
                >
                  Filtrar
                </Button>
                {canEditPhotos && (
                  <Button
                    leftIcon={<FaPlus />}
                    colorScheme="blue"
                    size="sm"
                    onClick={() => {
                      // Navegar a upload
                      window.location.href = "/photos/upload";
                    }}
                  >
                    Subir Fotos
                  </Button>
                )}
              </HStack>
            </Flex>

            {/* Estadísticas */}
            <HStack spacing={4}>
              <Badge colorScheme="blue" p={2} borderRadius="md">
                Total: {photos.length} fotos
              </Badge>
              <Badge colorScheme="green" p={2} borderRadius="md">
                Descritas: 1
              </Badge>
              <Badge colorScheme="orange" p={2} borderRadius="md">
                Sin describir: 2
              </Badge>
            </HStack>

            {/* Galería */}
            <PhotoGallery
              photos={photos}
              onEditPhoto={handleEditPhoto}
              onDeletePhoto={handleDeletePhoto}
              onTagPhoto={handleTagPhoto}
              canEdit={canEditPhotos}
              canDelete={canEditPhotos}
            />

            {/* Información adicional */}
            {photos.length === 0 && (
              <Box textAlign="center" py={8}>
                <Text fontSize="lg" color="gray.500" mb={4}>
                  No tienes fotos subidas aún
                </Text>
                {canEditPhotos && (
                  <Button
                    leftIcon={<FaPlus />}
                    colorScheme="blue"
                    onClick={() => {
                      window.location.href = "/photos/upload";
                    }}
                  >
                    Subir tu primera foto
                  </Button>
                )}
              </Box>
            )}
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}