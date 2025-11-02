import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Progress,
  Card,
  CardBody,
  Image,
  FormControl,
  FormLabel,
  Textarea,
  Input,
  Badge,
  Alert,
  AlertIcon,
  Divider,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaTag,
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTimes,
} from "react-icons/fa";

interface WizardStep {
  id: "people" | "places" | "events" | "emotions" | "details";
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface DescriptionData {
  people: string[];
  places: string[];
  events: string;
  emotions: string;
  details: string;
  tags: string[];
}

interface DescriptionWizardProps {
  photo: {
    id: string;
    url: string;
    patientId: string;
  };
  onComplete: (data: DescriptionData) => void;
  onCancel: () => void;
}

export function DescriptionWizard({ photo, onComplete, onCancel }: DescriptionWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [descriptionData, setDescriptionData] = useState<DescriptionData>({
    people: [],
    places: [],
    events: "",
    emotions: "",
    details: "",
    tags: [],
  });
  const [newPerson, setNewPerson] = useState("");
  const [newPlace, setNewPlace] = useState("");
  const [newTag, setNewTag] = useState("");
  const toast = useToast();

  const steps: WizardStep[] = [
    {
      id: "people",
      title: "Personas en la foto",
      description: "¿Quiénes aparecen en esta foto?",
      icon: <FaUser />,
    },
    {
      id: "places",
      title: "Lugares",
      description: "¿Dónde fue tomada esta foto?",
      icon: <FaMapMarkerAlt />,
    },
    {
      id: "events",
      title: "Evento o situación",
      description: "¿Qué está pasando en la foto?",
      icon: <FaCalendarAlt />,
    },
    {
      id: "emotions",
      title: "Emociones y recuerdos",
      description: "¿Cómo te sientes al ver esta foto?",
      icon: <FaTag />,
    },
    {
      id: "details",
      title: "Detalles adicionales",
      description: "¿Hay algo más que quieras agregar?",
      icon: <FaCheck />,
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const addUnique = (arr: string[], value: string) =>
    value.trim() && !arr.includes(value.trim()) ? [...arr, value.trim()] : arr;

  const addPerson = () => {
    setDescriptionData((prev) => ({ ...prev, people: addUnique(prev.people, newPerson) }));
    setNewPerson("");
  };
  const removePerson = (person: string) =>
    setDescriptionData((prev) => ({ ...prev, people: prev.people.filter((p) => p !== person) }));

  const addPlace = () => {
    setDescriptionData((prev) => ({ ...prev, places: addUnique(prev.places, newPlace) }));
    setNewPlace("");
  };
  const removePlace = (place: string) =>
    setDescriptionData((prev) => ({ ...prev, places: prev.places.filter((p) => p !== place) }));

  const addTag = () => {
    setDescriptionData((prev) => ({ ...prev, tags: addUnique(prev.tags, newTag) }));
    setNewTag("");
  };
  const removeTag = (tag: string) =>
    setDescriptionData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      onComplete(descriptionData);
      toast({
        title: "Descripción completada",
        description: "Tu descripción ha sido guardada exitosamente",
        status: "success",
        duration: 3000,
      });
    }
  };
  const prevStep = () => currentStep > 0 && setCurrentStep((s) => s - 1);

  const renderStepContent = () => {
    const step = steps[currentStep];

    if (step.id === "people") {
      return (
        <VStack spacing={4} w="full">
          <Text fontSize="sm" color="gray.600" textAlign="center">
            Menciona todas las personas que reconozcas en la foto
          </Text>

          <HStack w="full">
            <Input
              placeholder="Nombre de la persona"
              value={newPerson}
              onChange={(e) => setNewPerson(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPerson()}
            />
            <Button onClick={addPerson} colorScheme="blue">
              Agregar
            </Button>
          </HStack>

          {descriptionData.people.length > 0 && (
            <VStack spacing={2} w="full">
              <Text fontWeight="bold">Personas identificadas:</Text>
              <HStack spacing={2} flexWrap="wrap">
                {descriptionData.people.map((person) => (
                  <Badge key={person} colorScheme="blue" p={2} borderRadius="md">
                    <HStack spacing={2}>
                      <Text>{person}</Text>
                      <IconButton
                        aria-label="Eliminar"
                        size="xs"
                        variant="ghost"
                        icon={<FaTimes />}
                        onClick={() => removePerson(person)}
                      />
                    </HStack>
                  </Badge>
                ))}
              </HStack>
            </VStack>
          )}
        </VStack>
      );
    }

    if (step.id === "places") {
      return (
        <VStack spacing={4} w="full">
          <Text fontSize="sm" color="gray.600" textAlign="center">
            ¿Dónde fue tomada esta foto?
          </Text>

          <HStack w="full">
            <Input
              placeholder="Lugar (ej: casa, parque, restaurante)"
              value={newPlace}
              onChange={(e) => setNewPlace(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPlace()}
            />
            <Button onClick={addPlace} colorScheme="green">
              Agregar
            </Button>
          </HStack>

          {descriptionData.places.length > 0 && (
            <VStack spacing={2} w="full">
              <Text fontWeight="bold">Lugares identificados:</Text>
              <HStack spacing={2} flexWrap="wrap">
                {descriptionData.places.map((place) => (
                  <Badge key={place} colorScheme="green" p={2} borderRadius="md">
                    <HStack spacing={2}>
                      <Text>{place}</Text>
                      <IconButton
                        aria-label="Eliminar"
                        size="xs"
                        variant="ghost"
                        icon={<FaTimes />}
                        onClick={() => removePlace(place)}
                      />
                    </HStack>
                  </Badge>
                ))}
              </HStack>
            </VStack>
          )}
        </VStack>
      );
    }

    if (step.id === "events") {
      return (
        <VStack spacing={4} w="full">
          <Text fontSize="sm" color="gray.600" textAlign="center">
            Describe qué está pasando en la foto
          </Text>

          <FormControl>
            <FormLabel>Evento o situación:</FormLabel>
            <Textarea
              placeholder="Ej: Cumpleaños, reunión familiar, vacaciones, celebración..."
              value={descriptionData.events}
              onChange={(e) => setDescriptionData((p) => ({ ...p, events: e.target.value }))}
              rows={4}
            />
          </FormControl>
        </VStack>
      );
    }

    if (step.id === "emotions") {
      return (
        <VStack spacing={4} w="full">
          <Text fontSize="sm" color="gray.600" textAlign="center">
            ¿Qué emociones o recuerdos te trae esta foto?
          </Text>

          <FormControl>
            <FormLabel>Emociones y recuerdos:</FormLabel>
            <Textarea
              placeholder="Ej: Me siento feliz, me recuerda a mi infancia, me da nostalgia..."
              value={descriptionData.emotions}
              onChange={(e) => setDescriptionData((p) => ({ ...p, emotions: e.target.value }))}
              rows={4}
            />
          </FormControl>

          <VStack spacing={2} w="full">
            <Text fontWeight="bold">Etiquetas adicionales:</Text>
            <HStack w="full">
              <Input
                placeholder="Etiqueta (ej: familia, feliz, recuerdo)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
              />
              <Button onClick={addTag} colorScheme="purple">
                Agregar
              </Button>
            </HStack>

            {descriptionData.tags.length > 0 && (
              <HStack spacing={2} flexWrap="wrap">
                {descriptionData.tags.map((tag) => (
                  <Badge key={tag} colorScheme="purple" p={2} borderRadius="md">
                    <HStack spacing={2}>
                      <Text>{tag}</Text>
                      <IconButton
                        aria-label="Eliminar"
                        size="xs"
                        variant="ghost"
                        icon={<FaTimes />}
                        onClick={() => removeTag(tag)}
                      />
                    </HStack>
                  </Badge>
                ))}
              </HStack>
            )}
          </VStack>
        </VStack>
      );
    }

    // details
    return (
      <VStack spacing={4} w="full">
        <Text fontSize="sm" color="gray.600" textAlign="center">
          ¿Hay algo más que quieras agregar a tu descripción?
        </Text>

        <FormControl>
          <FormLabel>Detalles adicionales:</FormLabel>
          <Textarea
            placeholder="Cualquier detalle adicional que quieras recordar..."
            value={descriptionData.details}
            onChange={(e) => setDescriptionData((p) => ({ ...p, details: e.target.value }))}
            rows={4}
          />
        </FormControl>

        <Alert status="info">
          <AlertIcon />
          <Text fontSize="sm">
            Esta información ayudará a crear tu línea base y monitorear tu memoria a lo largo del tiempo.
          </Text>
        </Alert>
      </VStack>
    );
  };

  return (
    <VStack spacing={6} w="full" maxW="4xl" mx="auto">
      {/* Header */}
      <Box textAlign="center" w="full">
        <Text fontSize="2xl" fontWeight="bold" color="whiteAlpha.900" mb={2}>
          📝 Describir Foto - Paso {currentStep + 1} de {steps.length}
        </Text>
        <Progress value={progress} w="full" colorScheme="blue" size="lg" />
      </Box>

      {/* Foto */}
      <Card w="full">
        <CardBody>
          <VStack spacing={4}>
            <Image
              src={photo.url}
              alt="Foto a describir"
              maxH="300px"
              objectFit="cover"
              borderRadius="md"
            />
            <Text fontSize="sm" color="gray.500">
              Foto ID: {photo.id}
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Contenido del paso */}
      <Card w="full">
        <CardBody>
          <VStack spacing={4}>
            <HStack align="start" spacing={3}>
              {steps[currentStep].icon}
              <VStack align="start" spacing={1}>
                <Text fontSize="lg" fontWeight="bold" color="whiteAlpha.900">
                  {steps[currentStep].title}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  {steps[currentStep].description}
                </Text>
              </VStack>
            </HStack>

            <Divider />

            {renderStepContent()}
          </VStack>
        </CardBody>
      </Card>

      {/* Navegación */}
      <HStack spacing={4} w="full" justify="space-between">
        <Button
          leftIcon={<FaArrowLeft />}
          onClick={prevStep}
          isDisabled={currentStep === 0}
          variant="outline"
        >
          Anterior
        </Button>

        <Button onClick={onCancel} variant="ghost" colorScheme="red">
          Cancelar
        </Button>

        <Button
          rightIcon={currentStep === steps.length - 1 ? <FaCheck /> : <FaArrowRight />}
          onClick={nextStep}
          colorScheme="blue"
        >
          {currentStep === steps.length - 1 ? "Completar" : "Siguiente"}
        </Button>
      </HStack>
    </VStack>
  );
}
