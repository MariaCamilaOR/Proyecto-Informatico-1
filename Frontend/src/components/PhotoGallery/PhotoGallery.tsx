import { useState } from "react";
import {
  Box,
  Grid,
  Image,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Tooltip,
  Card,
  CardBody,
  Flex,
  Spacer
} from "@chakra-ui/react";
import { 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaTag, 
  FaCalendarAlt,
  FaUser
} from "react-icons/fa";

interface Photo {
  id: string;
  patientId: string;
  storagePath: string;
  tags: string[];
  createdAt: string;
  description?: string;
  uploadedBy?: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onEditPhoto?: (photo: Photo) => void;
  onDeletePhoto?: (photoId: string) => void;
  onTagPhoto?: (photo: Photo) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function PhotoGallery({ 
  photos, 
  onEditPhoto, 
  onDeletePhoto, 
  onTagPhoto,
  canEdit = false,
  canDelete = false 
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    onOpen();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPhotoStatus = (photo: Photo) => {
    if (photo.description) {
      return { label: "Descrita", color: "green" };
    }
    return { label: "Sin describir", color: "orange" };
  };

  // Fotos demo si no hay fotos reales
  const demoPhotos: Photo[] = photos.length > 0 ? photos : [
    {
      id: "demo-1",
      patientId: "demo-patient",
      storagePath: "demo/path/1",
      tags: ["familia", "cumpleaños"],
      createdAt: "2024-01-15T10:00:00Z",
      description: "Foto de mi cumpleaños con toda la familia",
      uploadedBy: "Cuidador"
    },
    {
      id: "demo-2", 
      patientId: "demo-patient",
      storagePath: "demo/path/2",
      tags: ["vacaciones", "playa"],
      createdAt: "2024-01-10T15:30:00Z",
      uploadedBy: "Paciente"
    },
    {
      id: "demo-3",
      patientId: "demo-patient", 
      storagePath: "demo/path/3",
      tags: ["amigos", "reunión"],
      createdAt: "2024-01-05T20:00:00Z",
      description: "Reunión con mis amigos de la universidad",
      uploadedBy: "Cuidador"
    }
  ];

  return (
    <Box>
      {/* Grid de fotos */}
      <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4}>
        {demoPhotos.map((photo) => {
          const status = getPhotoStatus(photo);
          return (
            <Card key={photo.id} overflow="hidden" cursor="pointer" _hover={{ shadow: "lg" }}>
              <Box position="relative">
                <Image
                  src={
                    // prefer actual url from backend, otherwise placeholder
                    (photo as any).url || `https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Foto+${photo.id}`
                  }
                  alt={`Foto ${photo.id}`}
                  w="full"
                  h="200px"
                  objectFit="cover"
                  onClick={() => handlePhotoClick(photo)}
                />
                
                {/* Overlay con información */}
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bg="blackAlpha.600"
                  color="white"
                  p={2}
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                  transition="opacity 0.2s"
                >
                  <HStack justify="space-between">
                    <Badge colorScheme={status.color} size="sm">
                      {status.label}
                    </Badge>
                    <HStack spacing={1}>
                      <Tooltip label="Ver detalles">
                        <IconButton
                          aria-label="Ver"
                          icon={<FaEye />}
                          size="sm"
                          variant="ghost"
                          color="white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePhotoClick(photo);
                          }}
                        />
                      </Tooltip>
                      {canEdit && (
                        <Tooltip label="Editar">
                          <IconButton
                            aria-label="Editar"
                            icon={<FaEdit />}
                            size="sm"
                            variant="ghost"
                            color="white"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditPhoto?.(photo);
                            }}
                          />
                        </Tooltip>
                      )}
                      {canDelete && (
                        <Tooltip label="Eliminar">
                          <IconButton
                            aria-label="Eliminar"
                            icon={<FaTrash />}
                            size="sm"
                            variant="ghost"
                            color="red.300"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePhoto?.(photo.id);
                            }}
                          />
                        </Tooltip>
                      )}
                    </HStack>
                  </HStack>
                </Box>
              </Box>

              <CardBody p={3}>
                <VStack align="start" spacing={2}>
                  {/* Tags */}
                  {photo.tags.length > 0 && (
                    <HStack spacing={1} flexWrap="wrap">
                      {photo.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} size="sm" colorScheme="blue">
                          {tag}
                        </Badge>
                      ))}
                      {photo.tags.length > 2 && (
                        <Badge size="sm" colorScheme="gray">
                          +{photo.tags.length - 2}
                        </Badge>
                      )}
                    </HStack>
                  )}

                  {/* Fecha y subido por */}
                  <HStack spacing={2} fontSize="xs" color="gray.500">
                    <HStack spacing={1}>
                      <FaCalendarAlt />
                      <Text>{formatDate(photo.createdAt || '')}</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <FaUser />
                      <Text>{photo.uploadedBy || '—'}</Text>
                    </HStack>
                  </HStack>

                  {/* Descripción corta */}
                  {photo.description && (
                    <Text fontSize="sm" noOfLines={2} color="gray.600">
                      {photo.description}
                    </Text>
                  )}
                    {/* Link to raw URL for debugging */}
                    {(photo as any).url && (
                      <Text fontSize="xs" color="blue.500" as="a" href={(photo as any).url} target="_blank" rel="noreferrer">
                        Abrir imagen
                      </Text>
                    )}
                </VStack>
              </CardBody>
            </Card>
          );
        })}
      </Grid>

      {/* Modal de vista detallada */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Text>Detalles de la Foto</Text>
              {selectedPhoto && (
                <Badge colorScheme={getPhotoStatus(selectedPhoto).color}>
                  {getPhotoStatus(selectedPhoto).label}
                </Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedPhoto && (
              <VStack spacing={4}>
                {/* Imagen grande */}
                <Image
                  src={(selectedPhoto as any).url || `https://via.placeholder.com/500x300/4A90E2/FFFFFF?text=Foto+${selectedPhoto.id}`}
                  alt={`Foto ${selectedPhoto.id}`}
                  w="full"
                  maxH="300px"
                  objectFit="cover"
                  borderRadius="md"
                />

                {/* Información detallada */}
                <VStack spacing={3} w="full" align="start">
                  {/* Tags */}
                  {selectedPhoto.tags.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" mb={2}>🏷️ Etiquetas:</Text>
                      <HStack spacing={2} flexWrap="wrap">
                        {selectedPhoto.tags.map((tag) => (
                          <Badge key={tag} colorScheme="blue" p={2}>
                            {tag}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  )}

                  {/* Descripción */}
                  {selectedPhoto.description ? (
                    <Box>
                      <Text fontWeight="bold" mb={2}>📝 Descripción:</Text>
                      <Text>{selectedPhoto.description}</Text>
                    </Box>
                  ) : (
                    <Box>
                      <Text fontWeight="bold" mb={2}>📝 Descripción:</Text>
                      <Text color="gray.500" fontStyle="italic">
                        Esta foto aún no tiene descripción
                      </Text>
                    </Box>
                  )}

                  {/* Metadatos */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>ℹ️ Información:</Text>
                    <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
                      <HStack>
                        <FaCalendarAlt />
                        <Text>Subida: {formatDate(selectedPhoto.createdAt)}</Text>
                      </HStack>
                      <HStack>
                        <FaUser />
                        <Text>Subida por: {selectedPhoto.uploadedBy}</Text>
                      </HStack>
                    </VStack>
                  </Box>

                  {/* Acciones */}
                  <Flex w="full" gap={2}>
                    <Button
                      leftIcon={<FaTag />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => onTagPhoto?.(selectedPhoto)}
                    >
                      Etiquetar
                    </Button>
                    {canEdit && (
                      <Button
                        leftIcon={<FaEdit />}
                        colorScheme="green"
                        variant="outline"
                        onClick={() => onEditPhoto?.(selectedPhoto)}
                      >
                        Editar
                      </Button>
                    )}
                    <Spacer />
                    {canDelete && (
                      <Button
                        leftIcon={<FaTrash />}
                        colorScheme="red"
                        variant="outline"
                        onClick={() => {
                          onDeletePhoto?.(selectedPhoto.id);
                          onClose();
                        }}
                      >
                        Eliminar
                      </Button>
                    )}
                  </Flex>
                </VStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
