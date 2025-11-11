import React, { useEffect, useMemo, useState } from "react";
import {
  Box, VStack, HStack, Text, Card, CardBody, Badge, Progress, Grid, GridItem,
  Button, Select, Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  Spinner, Alert, AlertIcon, Flex,
} from "@chakra-ui/react";
import { FaChartLine, FaCalendarAlt, FaUser, FaBrain, FaEye } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { getReportSummary } from "../../hooks/useReports";

type Trend = "up" | "down" | "stable";

interface ReportData {
  patientId: string;
  patientName: string;
  period: string;
  baselineScore: number;
  currentScore: number;
  trend: Trend;
  sessionsCompleted: number;
  photosDescribed: number;
  averageRecall: number;
  averageCoherence: number;
  lastSession: string | number | Date;
  recommendations: string[];
  perPhoto?: {
    [photoId: string]: {
      count: number;
      sum?: number;
      avg: number;
      title?: string;
      lastAttempt?: string | number | Date;
    };
  };
}

interface SimpleReportProps {
  patientId?: string;
  reportData?: ReportData;
  onExportPDF?: () => void;
  onShareWithDoctor?: () => void;
  canExport?: boolean;
  canShare?: boolean;
}

const getTrendColor = (trend: Trend) =>
  trend === "up" ? "green" : trend === "down" ? "red" : "blue";

const getScoreColor = (score: number) =>
  score >= 80 ? "green" : score >= 60 ? "yellow" : "red";

const getScoreLabel = (score: number) =>
  score >= 80 ? "Excelente" : score >= 60 ? "Bueno" : score >= 40 ? "Regular" : "Necesita atención";

export function SimpleReport({
  patientId,
  reportData,
  onExportPDF,
  onShareWithDoctor,
  canExport = false,
  canShare = false,
}: SimpleReportProps) {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const effectivePatientId = useMemo(() => {
    if (patientId) return patientId;
    if (!user) return undefined as unknown as string;
    const role = String(user.role || "").toUpperCase();
    if (role === "PATIENT") return user.uid;
    if (Array.isArray(user.linkedPatientIds) && user.linkedPatientIds.length > 0) {
      return user.linkedPatientIds[0];
    }
    return undefined as unknown as string;
  }, [patientId, user]);

  const [summary, setSummary] = useState<ReportData | null>(reportData ?? null);
  const [loading, setLoading] = useState<boolean>(!reportData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reportData) {
      setSummary(reportData);
      setLoading(false);
      setError(null);
      return;
    }
    if (!effectivePatientId) return;

    const days = selectedPeriod === "7d" ? 7 : selectedPeriod === "90d" ? 90 : 30;
    setLoading(true);
    getReportSummary(effectivePatientId, days)
      .then((res) => { setSummary(res as ReportData); setError(null); })
      .catch((e) => setError(e?.message || "Error cargando resumen"))
      .finally(() => setLoading(false));
  }, [reportData, effectivePatientId, selectedPeriod]);

  if (!reportData && loading) {
    return (
      <Card w="full">
        <CardBody>
          <HStack><Spinner /><Text>Cargando resumen…</Text></HStack>
        </CardBody>
      </Card>
    );
  }

  if (!summary || error) {
    return (
      <Card w="full">
        <CardBody>
          <Alert status="warning">
            <AlertIcon />
            No se pudo obtener el resumen de reportes. Verifica que existan reportes/quiz para este paciente.
          </Alert>
        </CardBody>
      </Card>
    );
  }

  const d = summary;

  return (
    <VStack spacing={6} w="full">
      {/* Header */}
      <Card w="full">
        <CardBody>
          <VStack spacing={4}>
            <HStack justify="space-between" w="full">
              <VStack align="start" spacing={1}>
                <Text fontSize="2xl" fontWeight="bold" color="whiteAlpha.900">📊 Reporte de Progreso</Text>
                <Text color="gray.400">{d.patientName} • {d.period}</Text>
              </VStack>

              <VStack spacing={2}>
                <Select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  size="sm"
                >
                  <option value="7d">Últimos 7 días</option>
                  <option value="30d">Últimos 30 días</option>
                  <option value="90d">Últimos 90 días</option>
                </Select>

                <HStack spacing={2}>
                  {canExport && (
                    <Button size="sm" colorScheme="blue" variant="outline"
                      onClick={onExportPDF || (() => window.print())}>
                      📄 Exportar PDF
                    </Button>
                  )}
                  {canShare && (
                    <Button size="sm" colorScheme="green" variant="outline"
                      onClick={onShareWithDoctor}>
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
          <Card><CardBody>
            <Stat>
              <StatLabel>Puntuación Actual</StatLabel>
              <StatNumber color={`${getScoreColor(d.currentScore)}.500`}>{d.currentScore}%</StatNumber>
              <StatHelpText>
                <StatArrow type={d.trend === "down" ? "decrease" : "increase"} />
                {d.trend === "up" ? "Mejorando" : d.trend === "down" ? "Disminuyendo" : "Estable"}
              </StatHelpText>
            </Stat>
          </CardBody></Card>
        </GridItem>

        <GridItem>
          <Card><CardBody>
            <Stat>
              <StatLabel>Sesiones Completadas</StatLabel>
              <StatNumber color="blue.500">{d.sessionsCompleted}</StatNumber>
              <StatHelpText><FaCalendarAlt /> {d.period}</StatHelpText>
            </Stat>
          </CardBody></Card>
        </GridItem>

        <GridItem>
          <Card><CardBody>
            <Stat>
              <StatLabel>Fotos Descritas</StatLabel>
              <StatNumber color="purple.500">{d.photosDescribed}</StatNumber>
              <StatHelpText><FaEye /> Total acumulado</StatHelpText>
            </Stat>
          </CardBody></Card>
        </GridItem>

        <GridItem>
          <Card><CardBody>
            <Stat>
              <StatLabel>Línea Base</StatLabel>
              <StatNumber color="gray.500">{d.baselineScore}%</StatNumber>
              <StatHelpText>Puntuación inicial</StatHelpText>
            </Stat>
          </CardBody></Card>
        </GridItem>
      </Grid>

      {/* Métricas detalladas */}
      <Grid templateColumns="repeat(2, 1fr)" gap={6} w="full">
        <GridItem>
          <Card><CardBody>
            <VStack spacing={4}>
              <HStack><FaBrain /><Text fontWeight="bold">Recall (Memoria)</Text></HStack>
              <VStack spacing={2} w="full">
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm">Promedio actual</Text>
                  <Badge colorScheme={getScoreColor(d.averageRecall)}>{d.averageRecall}%</Badge>
                </HStack>
                <Progress value={d.averageRecall} w="full" colorScheme={getScoreColor(d.averageRecall)} size="lg" />
                <Text fontSize="xs" color="gray.500">{getScoreLabel(d.averageRecall)}</Text>
              </VStack>
            </VStack>
          </CardBody></Card>
        </GridItem>

        <GridItem>
          <Card><CardBody>
            <VStack spacing={4}>
              <HStack><FaChartLine /><Text fontWeight="bold">Coherencia</Text></HStack>
              <VStack spacing={2} w="full">
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm">Promedio actual</Text>
                  <Badge colorScheme={getScoreColor(d.averageCoherence)}>{d.averageCoherence}%</Badge>
                </HStack>
                <Progress value={d.averageCoherence} w="full" colorScheme={getScoreColor(d.averageCoherence)} size="lg" />
                <Text fontSize="xs" color="gray.500">{getScoreLabel(d.averageCoherence)}</Text>
              </VStack>
            </VStack>
          </CardBody></Card>
        </GridItem>
      </Grid>

      {/* Comparación con línea base */}
      <Card w="full">
        <CardBody>
          <VStack spacing={4}>
            <Text fontWeight="bold" fontSize="lg">📈 Comparación con Línea Base</Text>
            <Grid templateColumns="repeat(3, 1fr)" gap={4} w="full">
              <Box textAlign="center">
                <Text fontSize="sm" color="gray.600">Línea Base</Text>
                <Text fontSize="2xl" fontWeight="bold" color="gray.500">{d.baselineScore}%</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="sm" color="gray.600">Actual</Text>
                <Text fontSize="2xl" fontWeight="bold" color={`${getScoreColor(d.currentScore)}.500`}>
                  {d.currentScore}%
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="sm" color="gray.600">Diferencia</Text>
                <Text fontSize="2xl" fontWeight="bold" color={getTrendColor(d.trend)}>
                  {d.trend === "up" ? "+" : d.trend === "down" ? "-" : ""}{Math.abs(d.currentScore - d.baselineScore)}%
                </Text>
              </Box>
            </Grid>
          </VStack>
        </CardBody>
      </Card>

      {/* Recomendaciones */}
      <Card w="full">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="bold" fontSize="lg">💡 Recomendaciones</Text>
            {d.recommendations.map((rec, i) => (
              <HStack key={i} spacing={3}>
                <Badge colorScheme="blue" borderRadius="full" minW="20px" textAlign="center">{i + 1}</Badge>
                <Text fontSize="sm">{rec}</Text>
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>

      {/* Desglose por Foto */}
      {d.perPhoto && Object.keys(d.perPhoto).length > 0 && (
        <Card w="full">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold" fontSize="lg">📸 Desglose por Foto</Text>
              <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
                {Object.entries(d.perPhoto).map(([photoId, data]) => (
                  <Card key={photoId} variant="outline">
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="bold">{data.title || `Foto #${photoId.slice(0, 8)}`}</Text>
                          <Badge colorScheme={getScoreColor(data.avg)}>{data.avg}%</Badge>
                        </HStack>
                        
                        <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                          <Box>
                            <Text fontSize="sm" color="gray.600">Intentos</Text>
                            <Text fontSize="lg" fontWeight="semibold">{data.count}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.600">Promedio</Text>
                            <Progress value={data.avg} colorScheme={getScoreColor(data.avg)} size="sm" mt={1} />
                          </Box>
                        </Grid>
                        
                        {data.lastAttempt && (
                          <Text fontSize="xs" color="gray.500">
                            Último intento: {new Date(data.lastAttempt).toLocaleDateString("es-ES")}
                          </Text>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Info */}
      <Card w="full">
        <CardBody>
          <VStack spacing={3}>
            <Text fontWeight="bold">ℹ️ Información del Reporte</Text>
            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full" fontSize="sm" color="gray.600">
              <HStack><FaUser /><Text>Paciente: {d.patientName}</Text></HStack>
              <HStack><FaCalendarAlt /><Text>Última sesión: {new Date(d.lastSession).toLocaleDateString("es-ES")}</Text></HStack>
              <HStack><FaChartLine /><Text>Período: {d.period}</Text></HStack>
              <HStack><FaBrain /><Text>Estado: {getScoreLabel(d.currentScore)}</Text></HStack>
            </Grid>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
