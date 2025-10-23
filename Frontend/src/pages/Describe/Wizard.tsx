import { Box, Heading, Text, Flex, VStack, Card, CardBody, Button, Alert, AlertIcon } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { DescriptionWizard } from "../../components/PhotoDescription/DescriptionWizard";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { useState } from "react";
import { FaPlay } from "react-icons/fa";

export default function DescribeWizard() {
  const { user } = useAuth();
  const [isWizardActive, setIsWizardActive] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const canDescribe = user && hasPermission(user.role, "describe_photos");

  const handleStartWizard = () => {
    // Simular selección de foto
    setSelectedPhoto({
      id: "demo-photo-wizard",
      url: "https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Foto+de+Familia+Demo",
      patientId: user?.uid || "demo-patient"
    });
    setIsWizardActive(true);
  };

  const handleWizardComplete = (data: any) => {
    console.log("Descripción completada:", data);
    setIsWizardActive(false);
    setSelectedPhoto(null);
  };

  const handleWizardCancel = () => {
    setIsWizardActive(false);
    setSelectedPhoto(null);
  };

  if (!canDescribe) {
    return (
      <Box>
        <Navbar />
        <Flex>
          <Sidebar />
          <Box flex="1" p={6}>
            <Alert status="warning">
              <AlertIcon />
              No tienes permisos para describir fotos con tu rol actual.
            </Alert>
          </Box>
        </Flex>
      </Box>
    );
  }

  if (isWizardActive && selectedPhoto) {
    return (
      <Box>
        <Navbar />
        <Flex>
          <Sidebar />
          <Box flex="1" p={6}>
            <DescriptionWizard
              photo={selectedPhoto}
              onComplete={handleWizardComplete}
              onCancel={handleWizardCancel}
            />
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
              <Heading mb={2}>🧙‍♂️ Asistente de Descripción</Heading>
              <Text color="gray.600">
                Te guiaremos paso a paso para describir tus fotos de manera detallada
              </Text>
            </Box>

            <Card>
              <CardBody>
                <VStack spacing={4}>
                  <Text fontWeight="bold" fontSize="lg">
                    ¿Cómo funciona el asistente?
                  </Text>
                  
                  <VStack spacing={3} align="start" w="full">
                    <Text fontSize="sm" color="gray.600">
                      <strong>Paso 1:</strong> Identifica las personas en la foto
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      <strong>Paso 2:</strong> Menciona los lugares donde fue tomada
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      <strong>Paso 3:</strong> Describe el evento o situación
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      <strong>Paso 4:</strong> Comparte tus emociones y recuerdos
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      <strong>Paso 5:</strong> Agrega detalles adicionales
                    </Text>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack spacing={4}>
                  <Text fontWeight="bold">📸 Selecciona una foto para describir:</Text>
                  
                  {/* Demo: Foto de ejemplo */}
                  <Box 
                    p={4} 
                    border="2px dashed" 
                    borderColor="gray.300" 
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ borderColor: "blue.400" }}
                    onClick={handleStartWizard}
                  >
                    <VStack spacing={2}>
                      <img
                        src="https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Foto+de+Familia"
                        alt="Foto de ejemplo"
                        style={{ width: "200px", height: "150px", objectFit: "cover", borderRadius: "8px" }}
                      />
                      <Text fontSize="sm" color="gray.600">
                        Haz clic para describir esta foto
                      </Text>
                    </VStack>
                  </Box>

                  <Button
                    leftIcon={<FaPlay />}
                    colorScheme="blue"
                    size="lg"
                    onClick={handleStartWizard}
                  >
                    🚀 Iniciar Asistente de Descripción
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack spacing={3} align="start">
                  <Text fontWeight="bold">💡 Consejos para mejores descripciones:</Text>
                  <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
                    <Text>• Tómate tu tiempo en cada paso</Text>
                    <Text>• Sé específico con nombres y lugares</Text>
                    <Text>• Menciona detalles como ropa, objetos, expresiones</Text>
                    <Text>• Comparte tus sentimientos y recuerdos</Text>
                    <Text>• No te preocupes si no recuerdas todo</Text>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}