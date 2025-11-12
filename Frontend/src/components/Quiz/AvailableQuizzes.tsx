import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  Button,
  Image,
  HStack,
  Badge,
  useToast,
  Spinner
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../hooks/useAuth';

export const AvailableQuizzes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<any[]>([]);
  const nav = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const loadPhotosWithDescriptions = async () => {
      if (!user?.linkedPatientIds?.[0]) return;
      try {
        setLoading(true);
        const patientId = user.linkedPatientIds[0];
        const resp = await api.get(`/photos/patient/${patientId}`);
        // Filtrar solo fotos que tienen descripción
        const withDesc = (resp.data || []).filter((p: any) => p.hasDescription);
        setPhotos(withDesc);
      } catch (e) {
        console.error('Error loading photos:', e);
        toast({
          title: 'Error cargando fotos',
          status: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadPhotosWithDescriptions();
  }, [user?.linkedPatientIds]);

  const handleCreateQuiz = async (photoId: string) => {
    if (!user?.linkedPatientIds?.[0]) return;
    try {
      const r = await api.post('/quizzes/generate', {
        patientId: user.linkedPatientIds[0],
        photoId
      });
      
      if (r.data?.id) {
        nav(`/quiz/take/${r.data.id}`);
      }
    } catch (e) {
      console.error('Error creating quiz:', e);
      toast({
        title: 'Error al crear el cuestionario',
        status: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box p={4}>
        <HStack>
          <Spinner />
          <Text>Cargando fotos...</Text>
        </HStack>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <Heading size="md">Cuestionarios disponibles</Heading>
        
        {photos.length === 0 ? (
          <Text color="gray.500">No hay fotos con descripción disponibles</Text>
        ) : (
          photos.map((photo) => (
            <Card key={photo.id}>
              <CardBody>
                <HStack spacing={4} align="start">
                  <Box width="200px" height="150px" borderRadius="md" overflow="hidden">
                    {photo.url ? (
                      <Image
                        src={photo.url}
                        alt="Foto para cuestionario"
                        objectFit="cover"
                        width="100%"
                        height="100%"
                      />
                    ) : (
                      <Box bg="gray.100" width="100%" height="100%" />
                    )}
                  </Box>
                  <VStack align="stretch" flex={1}>
                    <Text fontWeight="bold">{photo.title || 'Sin título'}</Text>
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {photo.description || 'Sin descripción'}
                    </Text>
                    {photo.tags?.length > 0 && (
                      <HStack>
                        {photo.tags.map((tag: string, i: number) => (
                          <Badge key={i} colorScheme="blue">
                            {tag}
                          </Badge>
                        ))}
                      </HStack>
                    )}
                    <Button
                      colorScheme="blue"
                      onClick={() => handleCreateQuiz(photo.id)}
                      size="sm"
                      alignSelf="flex-start"
                      mt={2}
                    >
                      Tomar cuestionario
                    </Button>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          ))
        )}
      </VStack>
    </Box>
  );
};