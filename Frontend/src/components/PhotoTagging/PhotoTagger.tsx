import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Button,
  Input,
  Badge,
  IconButton,
  Image,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Checkbox,
  CheckboxGroup,
  Stack,
  Divider,
  useToast,
  Alert,
  AlertIcon
} from "@chakra-ui/react";
import { FaTag, FaPlus, FaTimes, FaUser, FaMapMarkerAlt, FaCalendarAlt, FaHeart } from "react-icons/fa";

interface PhotoTag {
  id: string;
  type: "person" | "place" | "object" | "event" | "emotion";
  value: string;
  confidence?: number;
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface PhotoMetadata {
  id: string;
  url: string;
  tags: PhotoTag[];
  description?: string;
  dateTaken?: string;
  location?: string;
  people?: string[];
  emotions?: string[];
  objects?: string[];
  events?: string[];
}

interface PhotoTaggerProps {
  photo: PhotoMetadata;
  onSave: (metadata: PhotoMetadata) => void;
  onCancel: () => void;
  canEdit?: boolean;
}

export function PhotoTagger({ photo, onSave, onCancel, canEdit = true }: PhotoTaggerProps) {
  const [metadata, setMetadata] = useState<PhotoMetadata>(photo);
  const [newTag, setNewTag] = useState("");
  const [selectedTagType, setSelectedTagType] = useState<PhotoTag["type"]>("person");
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();

  const tagTypes = [
    { value: "person", label: "Persona", icon: <FaUser />, color: "blue" },
    { value: "place", label: "Lugar", icon: <FaMapMarkerAlt />, color: "green" },
    { value: "object", label: "Objeto", icon: <FaTag />, color: "purple" },
    { value: "event", label: "Evento", icon: <FaCalendarAlt />, color: "orange" },
    { value: "emotion", label: "Emoción", icon: <FaHeart />, color: "red" }
  ];

  const addTag = () => {
    if (newTag.trim()) {
      const tag: PhotoTag = {
        id: `tag-${Date.now()}`,
        type: selectedTagType,
        value: newTag.trim(),
        confidence: 1.0
      };

      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));

      setNewTag("");
      toast({
        title: "Etiqueta agregada",
        description: `${newTag} agregado como ${tagTypes.find(t => t.value === selectedTagType)?.label}`,
        status: "success",
        duration: 2000,
      });
    }
  };

  const removeTag = (tagId: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag.id !== tagId)
    }));
  };

  const updateMetadata = (field: keyof PhotoMetadata, value: any) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(metadata);
    toast({
      title: "Metadatos guardados",
      description: "La información de la foto ha sido actualizada",
      status: "success",
      duration: 3000,
    });
  };

  const getTagColor = (type: PhotoTag["type"]) => {
    return tagTypes.find(t => t.value === type)?.color || "gray";
  };

  const getTagIcon = (type: PhotoTag["type"]) => {
    return tagTypes.find(t => t.value === type)?.icon || <FaTag />;
  };

  const groupedTags = metadata.tags.reduce((acc, tag) => {
    if (!acc[tag.type]) {
      acc[tag.type] = [];
    }
    acc[tag.type].push(tag);
    return acc;
  }, {} as Record<string, PhotoTag[]>);

  return (
    <VStack spacing={6} w="full" maxW="4xl" mx="auto">
      {/* Header */}
      <Card w="full">
        <CardBody>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold">
                🏷️ Etiquetar Foto
              </Text>
              <Text color="gray.600">
                Agrega metadatos y etiquetas para organizar mejor tus fotos
              </Text>
            </VStack>
            
            <HStack spacing={2}>
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button colorScheme="blue" onClick={handleSave}>
                Guardar
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      <HStack spacing={6} w="full" align="start">
        {/* Foto */}
        <Card flex="1">
          <CardBody>
            <VStack spacing={4}>
              <Image
                src={metadata.url}
                alt="Foto a etiquetar"
                maxH="400px"
                objectFit="cover"
                borderRadius="md"
              />
              
              <Text fontSize="sm" color="gray.500">
                ID: {metadata.id}
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Panel de etiquetado */}
        <Card flex="1">
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Agregar nueva etiqueta */}
              <Box>
                <Text fontWeight="bold" mb={3}>Agregar Etiqueta</Text>
                
                <VStack spacing={3}>
                  <HStack w="full">
                    <Select
                      value={selectedTagType}
                      onChange={(e) => setSelectedTagType(e.target.value as PhotoTag["type"])}
                      size="sm"
                    >
                      {tagTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                  </HStack>
                  
                  <HStack w="full">
                    <Input
                      placeholder={`Agregar ${tagTypes.find(t => t.value === selectedTagType)?.label.toLowerCase()}...`}
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <IconButton
                      aria-label="Agregar etiqueta"
                      icon={<FaPlus />}
                      colorScheme="blue"
                      onClick={addTag}
                    />
                  </HStack>
                </VStack>
              </Box>

              <Divider />

              {/* Etiquetas existentes */}
              <Box>
                <Text fontWeight="bold" mb={3}>
                  Etiquetas ({metadata.tags.length})
                </Text>
                
                {metadata.tags.length === 0 ? (
                  <Alert status="info">
                    <AlertIcon />
                    <Text fontSize="sm">
                      No hay etiquetas. Agrega algunas para organizar mejor esta foto.
                    </Text>
                  </Alert>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {Object.entries(groupedTags).map(([type, tags]) => (
                      <Box key={type}>
                        <HStack mb={2}>
                          {getTagIcon(type as PhotoTag["type"])}
                          <Text fontWeight="bold" fontSize="sm" textTransform="capitalize">
                            {tagTypes.find(t => t.value === type)?.label} ({tags.length})
                          </Text>
                        </HStack>
                        
                        <HStack spacing={2} flexWrap="wrap">
                          {tags.map(tag => (
                            <Badge
                              key={tag.id}
                              colorScheme={getTagColor(tag.type)}
                              p={2}
                              borderRadius="md"
                            >
                              <HStack spacing={1}>
                                <Text>{tag.value}</Text>
                                {canEdit && (
                                  <IconButton
                                    aria-label="Eliminar etiqueta"
                                    icon={<FaTimes />}
                                    size="xs"
                                    variant="ghost"
                                    color="white"
                                    onClick={() => removeTag(tag.id)}
                                  />
                                )}
                              </HStack>
                            </Badge>
                          ))}
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>

              <Divider />

              {/* Metadatos adicionales */}
              <Box>
                <Text fontWeight="bold" mb={3}>Información Adicional</Text>
                
                <VStack spacing={3}>
                  <FormControl>
                    <FormLabel fontSize="sm">Descripción:</FormLabel>
                    <Textarea
                      placeholder="Describe brevemente esta foto..."
                      value={metadata.description || ""}
                      onChange={(e) => updateMetadata("description", e.target.value)}
                      rows={3}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Fecha tomada:</FormLabel>
                    <Input
                      type="date"
                      value={metadata.dateTaken || ""}
                      onChange={(e) => updateMetadata("dateTaken", e.target.value)}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Ubicación:</FormLabel>
                    <Input
                      placeholder="¿Dónde fue tomada esta foto?"
                      value={metadata.location || ""}
                      onChange={(e) => updateMetadata("location", e.target.value)}
                    />
                  </FormControl>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </HStack>

      {/* Sugerencias de etiquetas */}
      <Card w="full">
        <CardBody>
          <VStack spacing={3} align="start">
            <Text fontWeight="bold">💡 Sugerencias de etiquetas:</Text>
            
            <VStack spacing={2} align="start" fontSize="sm" color="gray.600">
              <Text>• <strong>Personas:</strong> Nombres de familiares, amigos, conocidos</Text>
              <Text>• <strong>Lugares:</strong> Casa, parque, restaurante, ciudad, país</Text>
              <Text>• <strong>Objetos:</strong> Comida, ropa, muebles, vehículos, regalos</Text>
              <Text>• <strong>Eventos:</strong> Cumpleaños, bodas, vacaciones, reuniones</Text>
              <Text>• <strong>Emociones:</strong> Feliz, nostálgico, emocionado, tranquilo</Text>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
