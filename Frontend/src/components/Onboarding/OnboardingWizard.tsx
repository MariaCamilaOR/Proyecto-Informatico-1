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
  Input,
  Textarea,
  Select,
  Checkbox,
  CheckboxGroup,
  Stack,
  Divider,
  Alert,
  AlertIcon,
  Badge,
  IconButton,
  useToast
} from "@chakra-ui/react";
import { FaArrowLeft, FaArrowRight, FaCheck, FaUser, FaCamera, FaMicrophone, FaBrain } from "react-icons/fa";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
}

interface OnboardingData {
  personalInfo: {
    name: string;
    age: number;
    relationship: string;
  };
  preferences: {
    reminderFrequency: string;
    sessionDuration: string;
    preferredTime: string;
  };
  baselinePhotos: string[];
  initialDescription: string;
  goals: string[];
  completed: boolean;
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    personalInfo: {
      name: "",
      age: 0,
      relationship: ""
    },
    preferences: {
      reminderFrequency: "daily",
      sessionDuration: "15",
      preferredTime: "morning"
    },
    baselinePhotos: [],
    initialDescription: "",
    goals: [],
    completed: false
  });
  const toast = useToast();

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "¡Bienvenido a DoYouRemember!",
      description: "Te ayudaremos a configurar tu perfil",
      icon: <FaUser />,
      required: false
    },
    {
      id: "personal",
      title: "Información Personal",
      description: "Cuéntanos sobre ti",
      icon: <FaUser />,
      required: true
    },
    {
      id: "preferences",
      title: "Preferencias",
      description: "Configura tus recordatorios",
      icon: <FaBrain />,
      required: true
    },
    {
      id: "baseline",
      title: "Línea Base",
      description: "Establece tu punto de partida",
      icon: <FaCamera />,
      required: true
    },
    {
      id: "goals",
      title: "Objetivos",
      description: "Define tus metas",
      icon: <FaCheck />,
      required: false
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const updateData = (field: keyof OnboardingData, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completar onboarding
      const completedData = { ...onboardingData, completed: true };
      onComplete(completedData);
      toast({
        title: "¡Onboarding completado!",
        description: "Tu perfil ha sido configurado exitosamente",
        status: "success",
        duration: 4000,
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const step = steps[currentStep];
    if (!step.required) return true;

    switch (step.id) {
      case "personal":
        return onboardingData.personalInfo.name && onboardingData.personalInfo.age > 0;
      case "preferences":
        return onboardingData.preferences.reminderFrequency && onboardingData.preferences.sessionDuration;
      case "baseline":
        return onboardingData.baselinePhotos.length >= 3;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case "welcome":
        return (
          <VStack spacing={6} textAlign="center">
            <Image
              src="https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=🧠"
              alt="DoYouRemember Logo"
              boxSize="150px"
              borderRadius="full"
            />
            
            <VStack spacing={4}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                ¡Bienvenido a DoYouRemember!
              </Text>
              <Text color="gray.600" maxW="md">
                Te ayudaremos a configurar tu perfil y establecer tu línea base para monitorear tu memoria de manera efectiva.
              </Text>
            </VStack>

            <VStack spacing={3} align="start" maxW="md">
              <Text fontWeight="bold">¿Qué haremos?</Text>
              <VStack spacing={2} align="start" fontSize="sm" color="gray.600">
                <Text>• Configurar tu información personal</Text>
                <Text>• Establecer tus preferencias de recordatorios</Text>
                <Text>• Crear tu línea base con fotos familiares</Text>
                <Text>• Definir tus objetivos de seguimiento</Text>
              </VStack>
            </VStack>
          </VStack>
        );

      case "personal":
        return (
          <VStack spacing={4} w="full">
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Esta información nos ayudará a personalizar tu experiencia
            </Text>
            
            <FormControl isRequired>
              <FormLabel>Nombre completo</FormLabel>
              <Input
                placeholder="Tu nombre completo"
                value={onboardingData.personalInfo.name}
                onChange={(e) => updateData("personalInfo", {
                  ...onboardingData.personalInfo,
                  name: e.target.value
                })}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Edad</FormLabel>
              <Input
                type="number"
                placeholder="Tu edad"
                value={onboardingData.personalInfo.age || ""}
                onChange={(e) => updateData("personalInfo", {
                  ...onboardingData.personalInfo,
                  age: parseInt(e.target.value) || 0
                })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Relación con el cuidador</FormLabel>
              <Select
                placeholder="Selecciona una opción"
                value={onboardingData.personalInfo.relationship}
                onChange={(e) => updateData("personalInfo", {
                  ...onboardingData.personalInfo,
                  relationship: e.target.value
                })}
              >
                <option value="self">Yo mismo/a</option>
                <option value="spouse">Cónyuge</option>
                <option value="parent">Padre/Madre</option>
                <option value="child">Hijo/Hija</option>
                <option value="sibling">Hermano/Hermana</option>
                <option value="other">Otro</option>
              </Select>
            </FormControl>
          </VStack>
        );

      case "preferences":
        return (
          <VStack spacing={4} w="full">
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Configura cómo quieres recibir recordatorios
            </Text>
            
            <FormControl isRequired>
              <FormLabel>Frecuencia de recordatorios</FormLabel>
              <Select
                value={onboardingData.preferences.reminderFrequency}
                onChange={(e) => updateData("preferences", {
                  ...onboardingData.preferences,
                  reminderFrequency: e.target.value
                })}
              >
                <option value="daily">Diario</option>
                <option value="every-other-day">Cada dos días</option>
                <option value="weekly">Semanal</option>
                <option value="custom">Personalizado</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Duración de sesión preferida</FormLabel>
              <Select
                value={onboardingData.preferences.sessionDuration}
                onChange={(e) => updateData("preferences", {
                  ...onboardingData.preferences,
                  sessionDuration: e.target.value
                })}
              >
                <option value="10">10 minutos</option>
                <option value="15">15 minutos</option>
                <option value="20">20 minutos</option>
                <option value="30">30 minutos</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Hora preferida</FormLabel>
              <Select
                value={onboardingData.preferences.preferredTime}
                onChange={(e) => updateData("preferences", {
                  ...onboardingData.preferences,
                  preferredTime: e.target.value
                })}
              >
                <option value="morning">Mañana (8:00 - 12:00)</option>
                <option value="afternoon">Tarde (12:00 - 18:00)</option>
                <option value="evening">Noche (18:00 - 22:00)</option>
                <option value="flexible">Flexible</option>
              </Select>
            </FormControl>
          </VStack>
        );

      case "baseline":
        return (
          <VStack spacing={4} w="full">
            <Alert status="info">
              <AlertIcon />
              <Text fontSize="sm">
                Para establecer tu línea base, necesitamos al menos 3 fotos familiares. 
                Estas servirán como referencia para medir tu progreso.
              </Text>
            </Alert>
            
            <VStack spacing={3} w="full">
              <Text fontWeight="bold">Fotos de línea base (mínimo 3):</Text>
              
              {/* Simulación de fotos subidas */}
              <HStack spacing={2} flexWrap="wrap">
                {onboardingData.baselinePhotos.map((photo, index) => (
                  <Badge key={index} colorScheme="green" p={2}>
                    Foto {index + 1} ✓
                  </Badge>
                ))}
              </HStack>

              <Button
                colorScheme="blue"
                variant="outline"
                onClick={() => {
                  if (onboardingData.baselinePhotos.length < 10) {
                    updateData("baselinePhotos", [
                      ...onboardingData.baselinePhotos,
                      `baseline-photo-${onboardingData.baselinePhotos.length + 1}`
                    ]);
                  }
                }}
                isDisabled={onboardingData.baselinePhotos.length >= 10}
              >
                📸 Agregar Foto de Línea Base
              </Button>

              {onboardingData.baselinePhotos.length >= 3 && (
                <Alert status="success">
                  <AlertIcon />
                  <Text fontSize="sm">
                    ¡Perfecto! Tienes {onboardingData.baselinePhotos.length} fotos para tu línea base.
                  </Text>
                </Alert>
              )}
            </VStack>
          </VStack>
        );

      case "goals":
        return (
          <VStack spacing={4} w="full">
            <Text fontSize="sm" color="gray.600" textAlign="center">
              ¿Qué te gustaría lograr con DoYouRemember?
            </Text>
            
            <CheckboxGroup
              value={onboardingData.goals}
              onChange={(values) => updateData("goals", values)}
            >
              <Stack spacing={3}>
                <Checkbox value="memory-monitoring">
                  Monitorear mi memoria a largo plazo
                </Checkbox>
                <Checkbox value="early-detection">
                  Detectar cambios tempranos en mi memoria
                </Checkbox>
                <Checkbox value="family-connection">
                  Mantener conexión con recuerdos familiares
                </Checkbox>
                <Checkbox value="peace-of-mind">
                  Tranquilidad para mí y mi familia
                </Checkbox>
                <Checkbox value="medical-insights">
                  Proporcionar información útil a mi médico
                </Checkbox>
              </Stack>
            </CheckboxGroup>

            <FormControl>
              <FormLabel>Descripción inicial (opcional)</FormLabel>
              <Textarea
                placeholder="Cuéntanos más sobre tus expectativas o preocupaciones..."
                value={onboardingData.initialDescription}
                onChange={(e) => updateData("initialDescription", e.target.value)}
                rows={3}
              />
            </FormControl>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
  <VStack spacing={6} w="full">
      {/* Header */}
      <Box textAlign="center" w="full">
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          {steps[currentStep].title}
        </Text>
        <Text color="gray.600" mb={4}>
          {steps[currentStep].description}
        </Text>
        <Progress value={progress} w="full" colorScheme="blue" size="lg" />
        <Text fontSize="sm" color="gray.500" mt={2}>
          Paso {currentStep + 1} de {steps.length}
        </Text>
      </Box>

      {/* Contenido del paso */}
      <Card w="full">
        <CardBody>
          <VStack spacing={6}>
            <HStack>
              {steps[currentStep].icon}
              <VStack align="start" spacing={1}>
                <Text fontSize="lg" fontWeight="bold">
                  {steps[currentStep].title}
                </Text>
                {steps[currentStep].required && (
                  <Badge colorScheme="red" size="sm">Requerido</Badge>
                )}
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

        <Button
          onClick={onSkip}
          variant="ghost"
          colorScheme="gray"
        >
          Omitir por ahora
        </Button>

        <Button
          rightIcon={currentStep === steps.length - 1 ? <FaCheck /> : <FaArrowRight />}
          onClick={nextStep}
          colorScheme="blue"
          isDisabled={!canProceed()}
        >
          {currentStep === steps.length - 1 ? "Completar" : "Siguiente"}
        </Button>
      </HStack>
    </VStack>
  );
}
