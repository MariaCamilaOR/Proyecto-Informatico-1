import { Box, Heading, Text, Flex, VStack, Alert, AlertIcon } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { OnboardingWizard } from "../../components/Onboarding/OnboardingWizard";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";

export default function Onboarding() {
  const { user } = useAuth();
  const [isOnboardingActive, setIsOnboardingActive] = useState(true);

  const handleOnboardingComplete = (data: any) => {
    console.log("Onboarding completado:", data);
    setIsOnboardingActive(false);
    // Aquí se guardaría la información en el backend
  };

  const handleOnboardingSkip = () => {
    console.log("Onboarding omitido");
    setIsOnboardingActive(false);
    // Redirigir al dashboard
  };

  if (!isOnboardingActive) {
    return (
      <Box>
        <Navbar />
        <Flex>
          <Sidebar />
          <Box flex="1" p={6}>
            <VStack spacing={6} align="stretch">
              <Alert status="success">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">¡Configuración completada!</Text>
                  <Text fontSize="sm">
                    Tu perfil ha sido configurado. Ahora puedes comenzar a usar DoYouRemember.
                  </Text>
                </VStack>
              </Alert>
              
              <VStack spacing={4} align="start">
                <Heading size="md">Próximos pasos:</Heading>
                <VStack align="start" spacing={2} fontSize="sm" color="gray.600">
                  <Text>• Sube más fotos familiares a tu galería</Text>
                  <Text>• Comienza a describir tus fotos usando el asistente</Text>
                  <Text>• Configura tus recordatorios en la sección de alertas</Text>
                  <Text>• Revisa tus reportes de progreso regularmente</Text>
                </VStack>
              </VStack>
            </VStack>
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
          <OnboardingWizard
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        </Box>
      </Flex>
    </Box>
  );
}
