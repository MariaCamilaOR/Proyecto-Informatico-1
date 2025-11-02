import { Box, Heading, Text, Grid, GridItem, Card, CardBody, Flex, Badge, VStack, HStack, Button } from "@chakra-ui/react";
import { Navbar } from "../components/Layout/Navbar";
import { Sidebar } from "../components/Layout/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { normalizeRole } from "../lib/roles";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role as any);
  const nav = useNavigate();

  return (
    <Box>
      <Navbar />
      <Flex>
        <Sidebar />
        <Box flex="1" p={6}>
          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading mb={2}>Dashboard</Heading>
              <Text color="gray.600">Bienvenido al prototipo de DoYouRemember</Text>
            </Box>

            {/* KPIs demo */}
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
              <GridItem>
                <Card><CardBody>
                  <HStack justify="space-between" mb={2}>
                    <Heading size="sm">📸 Fotos Subidas</Heading>
                    <Badge colorScheme="blue">Demo</Badge>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">12</Text>
                  <Text fontSize="sm" color="gray.500">Última: hace 2 días</Text>
                </CardBody></Card>
              </GridItem>
              <GridItem>
                <Card><CardBody>
                  <HStack justify="space-between" mb={2}>
                    <Heading size="sm">🎯 Sesiones Completadas</Heading>
                    <Badge colorScheme="green">Demo</Badge>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">8</Text>
                  <Text fontSize="sm" color="gray.500">Promedio: 85%</Text>
                </CardBody></Card>
              </GridItem>
              <GridItem>
                <Card><CardBody>
                  <HStack justify="space-between" mb={2}>
                    <Heading size="sm">📊 Reportes Generados</Heading>
                    <Badge colorScheme="purple">Demo</Badge>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.500">3</Text>
                  <Text fontSize="sm" color="gray.500">Último: ayer</Text>
                </CardBody></Card>
              </GridItem>
            </Grid>

            {/* Acciones rápidas por rol */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>🚀 Acciones rápidas</Heading>
                <HStack spacing={3} wrap="wrap">
                  {role === "PATIENT" && (
                    <>
                      <Button onClick={() => nav("/photos/upload")} colorScheme="blue">Subir fotos</Button>
                      <Button onClick={() => nav("/describe/wizard")} variant="outline">Describir (Wizard)</Button>
                      <Button onClick={() => nav("/reminders")} variant="ghost">Recordatorios</Button>
                    </>
                  )}
                  {role === "CAREGIVER" && (
                    <>
                      <Button onClick={() => nav("/photos")} colorScheme="blue">Fotos del paciente</Button>
                      <Button onClick={() => nav("/caregivers/patients")} variant="outline">Mis Pacientes</Button>
                      <Button onClick={() => nav("/alerts")} variant="ghost">Alertas</Button>
                    </>
                  )}
                  {role === "DOCTOR" && (
                    <>
                      <Button onClick={() => nav("/reports")} colorScheme="purple">Ver reportes</Button>
                      <Button onClick={() => nav("/alerts")} variant="outline">Políticas de alertas</Button>
                    </>
                  )}
                </HStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
