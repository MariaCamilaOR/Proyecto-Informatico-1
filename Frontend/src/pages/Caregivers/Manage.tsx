import { Box, Heading, Text, Flex, VStack, Alert, AlertIcon } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { CaregiverManager } from "../../components/CaregiverLink/CaregiverManager";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";

export default function CaregiversManage() {
  const { user } = useAuth();

  const canManageCaregivers = user && hasPermission(user.role, "manage_caregivers");

  if (!canManageCaregivers) {
    return (
      <Box>
        <Navbar />
        <Flex>
          <Sidebar />
          <Box flex="1" p={6}>
            <Alert status="warning">
              <AlertIcon />
              No tienes permisos para gestionar cuidadores con tu rol actual.
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
              <Heading mb={2}>👨‍👩‍👧‍👦 Gestión de Cuidadores</Heading>
              <Text color="gray.600">
                Administra los cuidadores vinculados a tu cuenta de paciente
              </Text>
            </Box>

            <CaregiverManager
              patientId={user?.uid || "demo-patient"}
              canManage={true}
            />

            {/* Información adicional */}
            <Box p={4} bg="blue.50" borderRadius="md">
              <VStack spacing={3} align="start">
                <Text fontWeight="bold">💡 Información sobre cuidadores:</Text>
                <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
                  <Text>• Los cuidadores pueden ayudarte a subir fotos y ver tu progreso</Text>
                  <Text>• Puedes configurar qué permisos tiene cada cuidador</Text>
                  <Text>• Las invitaciones expiran después de 7 días</Text>
                  <Text>• Puedes revocar el acceso de un cuidador en cualquier momento</Text>
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
