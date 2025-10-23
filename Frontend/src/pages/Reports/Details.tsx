import { Box, Heading, Text, Flex, VStack, HStack, Card, CardBody, Alert, AlertIcon, Badge } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { ReportFilters } from "../../components/Filters/ReportFilters";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";
import { useState } from "react";

export default function ReportsDetails() {
  const { user } = useAuth();
  const [activeFilters, setActiveFilters] = useState<any>(null);

  const canViewReports = user && hasPermission(user.role, "view_own_reports");

  const handleFiltersChange = (filters: any) => {
    setActiveFilters(filters);
    console.log("Filtros aplicados:", filters);
  };

  const handleClearFilters = () => {
    setActiveFilters(null);
    console.log("Filtros limpiados");
  };

  if (!canViewReports) {
    return (
      <Box>
        <Navbar />
        <Flex>
          <Sidebar />
          <Box flex="1" p={6}>
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
      <Flex>
        <Sidebar />
        <Box flex="1" p={6}>
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <Flex justify="space-between" align="center">
              <Box>
                <Heading mb={2}>📊 Detalles de Reportes</Heading>
                <Text color="gray.600">
                  Vista detallada con filtros avanzados
                </Text>
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
                          <Text>{new Date(activeFilters.dateRange.start).toLocaleDateString('es-ES')}</Text>
                        </HStack>
                      )}
                      
                      {activeFilters.dateRange?.end && (
                        <HStack>
                          <Badge colorScheme="blue">Fecha hasta:</Badge>
                          <Text>{new Date(activeFilters.dateRange.end).toLocaleDateString('es-ES')}</Text>
                        </HStack>
                      )}
                      
                      {(activeFilters.metrics?.recall[0] > 0 || activeFilters.metrics?.recall[1] < 100) && (
                        <HStack>
                          <Badge colorScheme="green">Recall:</Badge>
                          <Text>{activeFilters.metrics.recall[0]}% - {activeFilters.metrics.recall[1]}%</Text>
                        </HStack>
                      )}
                      
                      {(activeFilters.metrics?.coherence[0] > 0 || activeFilters.metrics?.coherence[1] < 100) && (
                        <HStack>
                          <Badge colorScheme="purple">Coherencia:</Badge>
                          <Text>{activeFilters.metrics.coherence[0]}% - {activeFilters.metrics.coherence[1]}%</Text>
                        </HStack>
                      )}
                      
                      {activeFilters.tags?.length > 0 && (
                        <HStack>
                          <Badge colorScheme="orange">Etiquetas:</Badge>
                          <HStack spacing={1}>
                            {activeFilters.tags.map((tag: string) => (
                              <Badge key={tag} size="sm">{tag}</Badge>
                            ))}
                          </HStack>
                        </HStack>
                      )}
                      
                      {(activeFilters.sessions?.min > 0 || activeFilters.sessions?.max < 50) && (
                        <HStack>
                          <Badge colorScheme="teal">Sesiones:</Badge>
                          <Text>{activeFilters.sessions.min} - {activeFilters.sessions.max}</Text>
                        </HStack>
                      )}
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Contenido de reportes filtrados */}
            <Card>
              <CardBody>
                <VStack spacing={4}>
                  <Text fontWeight="bold" fontSize="lg">
                    📈 Reportes Filtrados
                  </Text>
                  
                  {activeFilters ? (
                    <VStack spacing={3}>
                      <Text color="gray.600">
                        Mostrando reportes que coinciden con los filtros aplicados
                      </Text>
                      
                      {/* Simulación de datos filtrados */}
                      <VStack spacing={2} w="full">
                        <HStack justify="space-between" w="full" p={3} bg="gray.50" borderRadius="md">
                          <Text fontWeight="bold">Sesión 1 - 15/01/2024</Text>
                          <HStack spacing={2}>
                            <Badge colorScheme="green">Recall: 85%</Badge>
                            <Badge colorScheme="purple">Coherencia: 90%</Badge>
                          </HStack>
                        </HStack>
                        
                        <HStack justify="space-between" w="full" p={3} bg="gray.50" borderRadius="md">
                          <Text fontWeight="bold">Sesión 2 - 18/01/2024</Text>
                          <HStack spacing={2}>
                            <Badge colorScheme="green">Recall: 78%</Badge>
                            <Badge colorScheme="purple">Coherencia: 82%</Badge>
                          </HStack>
                        </HStack>
                        
                        <HStack justify="space-between" w="full" p={3} bg="gray.50" borderRadius="md">
                          <Text fontWeight="bold">Sesión 3 - 22/01/2024</Text>
                          <HStack spacing={2}>
                            <Badge colorScheme="green">Recall: 92%</Badge>
                            <Badge colorScheme="purple">Coherencia: 88%</Badge>
                          </HStack>
                        </HStack>
                      </VStack>
                    </VStack>
                  ) : (
                    <VStack spacing={3}>
                      <Text color="gray.600">
                        Aplica filtros para ver reportes específicos
                      </Text>
                      
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

            {/* Información adicional */}
            <Card>
              <CardBody>
                <VStack spacing={3} align="start">
                  <Text fontWeight="bold">💡 Cómo usar los filtros:</Text>
                  <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
                    <Text>• <strong>Fechas:</strong> Selecciona un rango para ver reportes de un período específico</Text>
                    <Text>• <strong>Métricas:</strong> Filtra por rangos de Recall y Coherencia</Text>
                    <Text>• <strong>Etiquetas:</strong> Selecciona etiquetas para ver reportes relacionados</Text>
                    <Text>• <strong>Sesiones:</strong> Filtra por número mínimo y máximo de sesiones</Text>
                    <Text>• <strong>Ordenar:</strong> Organiza los resultados por diferentes criterios</Text>
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
