import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  Card,
  CardBody,
  HStack,
  Badge,
  Button,
  Avatar,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { FaEye, FaChartLine, FaCamera } from "react-icons/fa";

export default function CaregiversPatients() {
  const { user } = useAuth();

  const canViewPatients = user && hasPermission(user.role, "view_patient_reports");

  // Datos demo de pacientes vinculados
  const linkedPatients = [
    {
      id: "patient-1",
      name: "María González",
      email: "maria.gonzalez@ejemplo.com",
      relationship: "Madre",
      status: "active",
      lastActivity: "2023-10-22",
      photosCount: 15,
      sessionsCount: 8,
      avgScore: 85,
    },
    {
      id: "patient-2",
      name: "Carlos Rodríguez",
      email: "carlos.rodriguez@ejemplo.com",
      relationship: "Padre",
      status: "active",
      lastActivity: "2023-10-21",
      photosCount: 22,
      sessionsCount: 12,
      avgScore: 78,
    },
  ];

  if (!canViewPatients) {
    return (
      <Box>
        <Navbar />
        <Flex>
          <Sidebar />
          <Box flex="1" p={6}>
            <Alert status="warning">
              <AlertIcon />
              No tienes permisos para ver pacientes con tu rol actual.
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
              <Heading mb={2}>👥 Mis Pacientes</Heading>
              <Text color="gray.600">
                Pacientes vinculados a tu cuenta de cuidador
              </Text>
            </Box>

            {linkedPatients.length === 0 ? (
              <Card>
                <CardBody>
                  <Alert status="info">
                    <AlertIcon />
                    No tienes pacientes vinculados aún. Contacta a un paciente para que te invite.
                  </Alert>
                </CardBody>
              </Card>
            ) : (
              <VStack spacing={4} align="stretch">
                {linkedPatients.map((patient) => (
                  <Card key={patient.id}>
                    <CardBody>
                      <HStack justify="space-between" align="start">
                        <HStack spacing={4}>
                          <Avatar
                            name={patient.name}
                            src={undefined}
                            size="lg"
                          />
                          <VStack align="start" spacing={1}>
                            <Heading size="md">{patient.name}</Heading>
                            <Text color="gray.600" fontSize="sm">
                              {patient.relationship} • {patient.email}
                            </Text>
                            <HStack spacing={4}>
                              <Badge colorScheme="green">Activo</Badge>
                              <Text fontSize="sm" color="gray.500">
                                Última actividad: {patient.lastActivity}
                              </Text>
                            </HStack>
                          </VStack>
                        </HStack>

                        <VStack spacing={2} align="end">
                          <HStack spacing={4}>
                            <VStack spacing={0}>
                              <Text fontSize="sm" color="gray.500">Fotos</Text>
                              <Text fontWeight="bold" color="blue.500">
                                {patient.photosCount}
                              </Text>
                            </VStack>
                            <VStack spacing={0}>
                              <Text fontSize="sm" color="gray.500">Sesiones</Text>
                              <Text fontWeight="bold" color="green.500">
                                {patient.sessionsCount}
                              </Text>
                            </VStack>
                            <VStack spacing={0}>
                              <Text fontSize="sm" color="gray.500">Promedio</Text>
                              <Text fontWeight="bold" color="purple.500">
                                {patient.avgScore}%
                              </Text>
                            </VStack>
                          </HStack>

                          <HStack spacing={2}>
                            <Button
                              leftIcon={<FaEye />}
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Navegar a ver perfil del paciente
                                console.log("Ver perfil de:", patient.name);
                              }}
                            >
                              Ver Perfil
                            </Button>
                            <Button
                              leftIcon={<FaChartLine />}
                              size="sm"
                              colorScheme="blue"
                              onClick={() => {
                                // Navegar a reportes del paciente
                                console.log("Ver reportes de:", patient.name);
                              }}
                            >
                              Reportes
                            </Button>
                            <Button
                              leftIcon={<FaCamera />}
                              size="sm"
                              colorScheme="green"
                              onClick={() => {
                                // Navegar a subir fotos para el paciente
                                console.log("Subir fotos para:", patient.name);
                              }}
                            >
                              Subir Fotos
                            </Button>
                          </HStack>
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}

            {/* Información adicional */}
            <Box p={4} bg="green.50" borderRadius="md">
              <VStack spacing={3} align="start">
                <Text fontWeight="bold">💡 Como cuidador puedes:</Text>
                <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
                  <Text>• Ver el progreso y reportes de tus pacientes</Text>
                  <Text>• Subir fotos en nombre del paciente</Text>
                  <Text>• Configurar recordatorios para sesiones</Text>
                  <Text>• Recibir alertas sobre cambios importantes</Text>
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
