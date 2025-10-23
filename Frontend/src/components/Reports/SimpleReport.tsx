import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Badge,
  Progress,
  Divider,
  Grid,
  GridItem,
  Button,
  Select,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow
} from "@chakra-ui/react";
import { FaChartLine, FaCalendarAlt, FaUser, FaBrain, FaEye } from "react-icons/fa";

interface ReportData {
  patientId: string;
  patientName: string;
  period: string;
  baselineScore: number;
  currentScore: number;
  trend: "up" | "down" | "stable";
  sessionsCompleted: number;
  photosDescribed: number;
  averageRecall: number;
  averageCoherence: number;
  lastSession: string;
  recommendations: string[];
}

interface SimpleReportProps {
  reportData: ReportData;
  onExportPDF?: () => void;
  onShareWithDoctor?: () => void;
  canExport?: boolean;
  canShare?: boolean;
}

export function SimpleReport({ 
  reportData, 
  onExportPDF, 
  onShareWithDoctor,
  canExport = false,
  canShare = false 
}: SimpleReportProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return "green";
      case "down": return "red";
      default: return "blue";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <StatArrow type="increase" />;
      case "down": return <StatArrow type="decrease" />;
      default: return <StatArrow type="increase" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "green";
    if (score >= 60) return "yellow";
    return "red";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Bueno";
    if (score >= 40) return "Regular";
    return "Necesita atención";
  };

  // Datos demo si no se proporcionan
  const demoData: ReportData = {
    patientId: "demo-patient-123",
    patientName: "María González",
    period: "Últimos 30 días",
    baselineScore: 75,
    currentScore: 82,
    trend: "up",
    sessionsCompleted: 8,
    photosDescribed: 12,
    averageRecall: 78,
    averageCoherence: 85,
    lastSession: "2024-01-20",
    recommendations: [
      "Continuar con las sesiones regulares",
      "Mantener la rutina de descripción de fotos",
      "Considerar aumentar la frecuencia a 3 veces por semana"
    ]
  };

  const data = reportData || demoData;

  return (
    <VStack spacing={6} w="full">
      {/* Header del reporte */}
      <Card w="full">
        <CardBody>
          <VStack spacing={4}>
            <HStack justify="space-between" w="full">
              <VStack align="start" spacing={1}>
                <Text fontSize="2xl" fontWeight="bold">
                  📊 Reporte de Progreso
                </Text>
                <Text color="gray.600">
                  {data.patientName} • {data.period}
                </Text>
              </VStack>
              
              <VStack spacing={2}>
                <Select 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  size="sm"
                >
                  <option value="7d">Últimos 7 días</option>
                  <option value="30d">Últimos 30 días</option>
                  <option value="90d">Últimos 90 días</option>
                </Select>
                
                <HStack spacing={2}>
                  {canExport && (
                    <Button size="sm" colorScheme="blue" variant="outline">
                      📄 Exportar PDF
                    </Button>
                  )}
                  {canShare && (
                    <Button size="sm" colorScheme="green" variant="outline">
                      👩‍⚕️ Compartir con médico
                    </Button>
                  )}
                </HStack>
              </VStack>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Métricas principales */}
      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} w="full">
        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Puntuación Actual</StatLabel>
                <StatNumber color={`${getScoreColor(data.currentScore)}.500`}>
                  {data.currentScore}%
                </StatNumber>
                <StatHelpText>
                  {getTrendIcon(data.trend)}
                  {data.trend === "up" ? "Mejorando" : data.trend === "down" ? "Disminuyendo" : "Estable"}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Sesiones Completadas</StatLabel>
                <StatNumber color="blue.500">
                  {data.sessionsCompleted}
                </StatNumber>
                <StatHelpText>
                  <FaCalendarAlt /> {data.period}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Fotos Descritas</StatLabel>
                <StatNumber color="purple.500">
                  {data.photosDescribed}
                </StatNumber>
                <StatHelpText>
                  <FaEye /> Total acumulado
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Línea Base</StatLabel>
                <StatNumber color="gray.500">
                  {data.baselineScore}%
                </StatNumber>
                <StatHelpText>
                  Puntuación inicial
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Métricas detalladas */}
      <Grid templateColumns="repeat(2, 1fr)" gap={6} w="full">
        <GridItem>
          <Card>
            <CardBody>
              <VStack spacing={4}>
                <HStack>
                  <FaBrain />
                  <Text fontWeight="bold">Recall (Memoria)</Text>
                </HStack>
                
                <VStack spacing={2} w="full">
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm">Promedio actual</Text>
                    <Badge colorScheme={getScoreColor(data.averageRecall)}>
                      {data.averageRecall}%
                    </Badge>
                  </HStack>
                  <Progress 
                    value={data.averageRecall} 
                    w="full" 
                    colorScheme={getScoreColor(data.averageRecall)}
                    size="lg"
                  />
                  <Text fontSize="xs" color="gray.500">
                    {getScoreLabel(data.averageRecall)}
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <VStack spacing={4}>
                <HStack>
                  <FaChartLine />
                  <Text fontWeight="bold">Coherencia</Text>
                </HStack>
                
                <VStack spacing={2} w="full">
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm">Promedio actual</Text>
                    <Badge colorScheme={getScoreColor(data.averageCoherence)}>
                      {data.averageCoherence}%
                    </Badge>
                  </HStack>
                  <Progress 
                    value={data.averageCoherence} 
                    w="full" 
                    colorScheme={getScoreColor(data.averageCoherence)}
                    size="lg"
                  />
                  <Text fontSize="xs" color="gray.500">
                    {getScoreLabel(data.averageCoherence)}
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Comparación con línea base */}
      <Card w="full">
        <CardBody>
          <VStack spacing={4}>
            <Text fontWeight="bold" fontSize="lg">
              📈 Comparación con Línea Base
            </Text>
            
            <Grid templateColumns="repeat(3, 1fr)" gap={4} w="full">
              <Box textAlign="center">
                <Text fontSize="sm" color="gray.600">Línea Base</Text>
                <Text fontSize="2xl" fontWeight="bold" color="gray.500">
                  {data.baselineScore}%
                </Text>
              </Box>
              
              <Box textAlign="center">
                <Text fontSize="sm" color="gray.600">Actual</Text>
                <Text fontSize="2xl" fontWeight="bold" color={`${getScoreColor(data.currentScore)}.500`}>
                  {data.currentScore}%
                </Text>
              </Box>
              
              <Box textAlign="center">
                <Text fontSize="sm" color="gray.600">Diferencia</Text>
                <Text fontSize="2xl" fontWeight="bold" color={getTrendColor(data.trend)}>
                  {data.trend === "up" ? "+" : data.trend === "down" ? "-" : ""}
                  {Math.abs(data.currentScore - data.baselineScore)}%
                </Text>
              </Box>
            </Grid>
          </VStack>
        </CardBody>
      </Card>

      {/* Recomendaciones */}
      <Card w="full">
        <CardBody>
          <VStack spacing={4}>
            <Text fontWeight="bold" fontSize="lg">
              💡 Recomendaciones
            </Text>
            
            <VStack spacing={2} align="start" w="full">
              {data.recommendations.map((recommendation, index) => (
                <HStack key={index} spacing={3}>
                  <Badge colorScheme="blue" borderRadius="full" minW="20px" textAlign="center">
                    {index + 1}
                  </Badge>
                  <Text fontSize="sm">{recommendation}</Text>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Información adicional */}
      <Card w="full">
        <CardBody>
          <VStack spacing={3}>
            <Text fontWeight="bold">ℹ️ Información del Reporte</Text>
            
            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full" fontSize="sm" color="gray.600">
              <HStack>
                <FaUser />
                <Text>Paciente: {data.patientName}</Text>
              </HStack>
              <HStack>
                <FaCalendarAlt />
                <Text>Última sesión: {new Date(data.lastSession).toLocaleDateString('es-ES')}</Text>
              </HStack>
              <HStack>
                <FaChartLine />
                <Text>Período: {data.period}</Text>
              </HStack>
              <HStack>
                <FaBrain />
                <Text>Estado: {getScoreLabel(data.currentScore)}</Text>
              </HStack>
            </Grid>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
