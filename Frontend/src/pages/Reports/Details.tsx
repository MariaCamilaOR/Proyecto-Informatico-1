import {
  Box, Heading, Text, Flex, VStack, HStack, Card, CardBody, Alert, AlertIcon, Badge,
} from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { ReportFilters } from "../../components/Filters/ReportFilters";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { useState } from "react";

type FilterOptions = {
  dateRange: { start: string; end: string };
  metrics: { recall: [number, number]; coherence: [number, number] };
  tags: string[];
  sessions: { min: number; max: number };
  sortBy: string;
  sortOrder: "asc" | "desc";
};

export default function ReportsDetails() {
  const { user } = useAuth();
  const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(null);

  const canViewReports =
    !!user &&
    (hasPermission(user.role, "view_own_reports") ||
      hasPermission(user.role, "view_patient_reports") ||
      hasPermission(user.role, "view_detailed_analytics"));

  const handleFiltersChange = (filters: FilterOptions) => {
    setActiveFilters(filters);
    // eslint-disable-next-line no-console
    console.log("Filtros aplicados:", filters);
  };

  const handleClearFilters = () => {
    setActiveFilters(null);
    // eslint-disable-next-line no-console
    console.log("Filtros limpiados");
  };

  if (!canViewReports) {
    return (
      <Box>
        <Navbar />
        <Flex direction={{ base: "column", md: "row" }}>
          <Sidebar />
          <Box flex="1" p={{ base: 4, md: 6 }}>
            <Alert status="warning">
              <AlertIcon />
              No tienes permisos para ver reportes con tu rol actual.
            </Alert>
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <Flex justify="space-between" align="center">
              <Box>
                <Heading mb={2} color="blue.700">📊 Detalles de Reportes</Heading>
                <Text color="blue.600">Vista detallada con filtros avanzados</Text>
              </Box>

              <ReportFilters
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                availableTags={["familia", "amigos", "vacaciones", "cumpleaños", "trabajo", "hogar"]}
              />
            </Flex>

            {/* Filtros activos */}
            {activeFilters && (
              <Card>
                <CardBody>
                  <VStack spacing={3} align="start">
                    <Text fontWeight="bold">🔍 Filtros Activos:</Text>

                    <VStack spacing={2} align="start" fontSize="sm">
                      {activeFilters.dateRange?.start && (
                        <HStack>
                          <Badge colorScheme="blue">Fecha desde:</Badge>
                          <Text>{new Date(activeFilters.dateRange.start).toLocaleDateString("es-ES")}</Text>
                        </HStack>
                      )}

                      {activeFilters.dateRange?.end && (
                        <HStack>
                          <Badge colorScheme="blue">Fecha hasta:</Badge>
                          <Text>{new Date(activeFilters.dateRange.end).toLocaleDateString("es-ES")}</Text>
                        </HStack>
                      )}

                      {(activeFilters.metrics?.recall?.[0] > 0 ||
                        activeFilters.metrics?.recall?.[1] < 100) && (
                        <HStack>
                          <Badge colorScheme="green">Recall:</Badge>
                          <Text>
                            {activeFilters.metrics.recall[0]}% - {activeFilters.metrics.recall[1]}%
                          </Text>
                        </HStack>
                      )}

                      {(activeFilters.metrics?.coherence?.[0] > 0 ||
                        activeFilters.metrics?.coherence?.[1] < 100) && (
                        <HStack>
                          <Badge colorScheme="purple">Coherencia:</Badge>
                          <Text>
                            {activeFilters.metrics.coherence[0]}% - {activeFilters.metrics.coherence[1]}%
                          </Text>
                        </HStack>
                      )}

                      {activeFilters.tags?.length > 0 && (
                        <HStack align="start">
                          <Badge colorScheme="orange">Etiquetas:</Badge>
                          <HStack spacing={1} flexWrap="wrap">
                            {activeFilters.tags.map((tag) => (
                              <Badge key={tag} size="sm">{tag}</Badge>
                            ))}
                          </HStack>
                        </HStack>
                      )}

                      {/* Sesiones: chequeo seguro */}
                      {typeof activeFilters.sessions?.min === "number" &&
                        typeof activeFilters.sessions?.max === "number" &&
                        (activeFilters.sessions.min > 0 || activeFilters.sessions.max < 50) && (
                          <HStack>
                            <Badge colorScheme="teal">Sesiones:</Badge>
                            <Text>
                              {activeFilters.sessions.min} - {activeFilters.sessions.max}
                            </Text>
                          </HStack>
                        )}
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Contenido de reportes filtrados (demo) */}
            <Card>
              <CardBody>
                <VStack spacing={4}>
                  <Text fontWeight="bold" fontSize="lg">📈 Reportes Filtrados</Text>

                  {activeFilters ? (
                    <VStack spacing={2} w="full">
                      <HStack justify="space-between" w="full" p={3} bg="blue.50" borderRadius="md">
                        <Text fontWeight="bold">Sesión 1 - 15/01/2024</Text>
                        <HStack spacing={2}>
                          <Badge colorScheme="green">Recall: 85%</Badge>
                          <Badge colorScheme="purple">Coherencia: 90%</Badge>
                        </HStack>
                      </HStack>
                      <HStack justify="space-between" w="full" p={3} bg="blue.50" borderRadius="md">
                        <Text fontWeight="bold">Sesión 2 - 18/01/2024</Text>
                        <HStack spacing={2}>
                          <Badge colorScheme="green">Recall: 78%</Badge>
                          <Badge colorScheme="purple">Coherencia: 82%</Badge>
                        </HStack>
                      </HStack>
                      <HStack justify="space-between" w="full" p={3} bg="blue.50" borderRadius="md">
                        <Text fontWeight="bold">Sesión 3 - 22/01/2024</Text>
                        <HStack spacing={2}>
                          <Badge colorScheme="green">Recall: 92%</Badge>
                          <Badge colorScheme="purple">Coherencia: 88%</Badge>
                        </HStack>
                      </HStack>
                    </VStack>
                  ) : (
                    <VStack spacing={3}>
                      <Text color="blue.600">Aplica filtros para ver reportes específicos</Text>
                      <Alert status="info">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Usa los filtros para encontrar reportes por fecha, métricas, etiquetas o número de sesiones.
                        </Text>
                      </Alert>
                    </VStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
