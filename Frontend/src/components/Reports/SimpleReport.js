import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import {
  Box, VStack, HStack, Text, Card, CardBody, Badge, Progress, Grid, GridItem,
  Button, Select, Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  Spinner, Alert, AlertIcon
} from "@chakra-ui/react";
import { FaChartLine, FaCalendarAlt, FaUser, FaBrain, FaEye } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { useReportSummary } from "../../hooks/useReports";

const getTrendColor = (trend) => trend === "up" ? "green" : trend === "down" ? "red" : "blue";
const getScoreColor = (score) => (score >= 80 ? "green" : score >= 60 ? "yellow" : "red");
const getScoreLabel = (score) => score >= 80 ? "Excelente" : score >= 60 ? "Bueno" : score >= 40 ? "Regular" : "Necesita atención";

export function SimpleReport({
  patientId,
  reportData,
  onExportPDF,
  onShareWithDoctor,
  canExport = false,
  canShare = false,
}) {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const effectivePatientId = useMemo(() => {
    if (patientId) return patientId;
    if (!user) return undefined;
    const role = String(user.role || "").toUpperCase();
    if (role === "PATIENT") return user.uid;
    if (Array.isArray(user.linkedPatientIds) && user.linkedPatientIds.length > 0) {
      return user.linkedPatientIds[0];
    }
    return undefined;
  }, [patientId, user]);

  const { data, isLoading, isError } = useReportSummary(
    reportData ? undefined : effectivePatientId,
    selectedPeriod
  );

  const d = reportData ?? data;

  if (!reportData && isLoading) {
    return _jsx(Card, { w: "full", children: _jsx(CardBody, {
      children: _jsxs(HStack, { children: [_jsx(Spinner, {}), _jsx(Text, { children: "Cargando resumen…" })] })
    }) });
  }

  if (!reportData && (isError || !d)) {
    return _jsx(Card, { w: "full", children: _jsx(CardBody, {
      children: _jsxs(Alert, { status: "warning", children: [_jsx(AlertIcon, {}), "No se pudo obtener el resumen de reportes. Verifica que existan reportes/quiz para este paciente."] })
    }) });
  }

  return (_jsxs(VStack, { spacing: 6, w: "full", children: [
    _jsx(Card, { w: "full", children: _jsx(CardBody, { children: _jsx(VStack, { spacing: 4, children:
      _jsxs(HStack, { justify: "space-between", w: "full", children: [
        _jsxs(VStack, { align: "start", spacing: 1, children: [
          _jsx(Text, { fontSize: "2xl", fontWeight: "bold", color: "whiteAlpha.900", children: "📊 Reporte de Progreso" }),
          _jsxs(Text, { color: "gray.400", children: [d.patientName, " • ", d.period] })
        ]}),
        _jsxs(VStack, { spacing: 2, children: [
          _jsxs(Select, { value: selectedPeriod, onChange: (e) => setSelectedPeriod(e.target.value), size: "sm", children: [
            _jsx("option", { value: "7d", children: "Últimos 7 días" }),
            _jsx("option", { value: "30d", children: "Últimos 30 días" }),
            _jsx("option", { value: "90d", children: "Últimos 90 días" })
          ] }),
          _jsxs(HStack, { spacing: 2, children: [
            canExport && (_jsx(Button, { size: "sm", colorScheme: "blue", variant: "outline", onClick: onExportPDF || (() => window.print()), children: "📄 Exportar PDF" })),
            canShare && (_jsx(Button, { size: "sm", colorScheme: "green", variant: "outline", onClick: onShareWithDoctor, children: "👩‍⚕️ Compartir con médico" }))
          ] })
        ]})
      ]})
    }) }) }),
    _jsxs(Grid, { templateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 4, w: "full", children: [
      _jsx(GridItem, { children: _jsx(Card, { children: _jsx(CardBody, { children: _jsxs(Stat, { children: [
        _jsx(StatLabel, { children: "Puntuación Actual" }),
        _jsxs(StatNumber, { color: `${getScoreColor(d.currentScore)}.500`, children: [d.currentScore, "%"] }),
        _jsxs(StatHelpText, { children: [_jsx(StatArrow, { type: d.trend === "down" ? "decrease" : "increase" }), d.trend === "up" ? "Mejorando" : d.trend === "down" ? "Disminuyendo" : "Estable"] })
      ] }) }) }) }),
      _jsx(GridItem, { children: _jsx(Card, { children: _jsx(CardBody, { children: _jsxs(Stat, { children: [
        _jsx(StatLabel, { children: "Sesiones Completadas" }),
        _jsx(StatNumber, { color: "blue.500", children: d.sessionsCompleted }),
        _jsxs(StatHelpText, { children: [_jsx(FaCalendarAlt, {}), " ", d.period] })
      ] }) }) }) }),
      _jsx(GridItem, { children: _jsx(Card, { children: _jsx(CardBody, { children: _jsxs(Stat, { children: [
        _jsx(StatLabel, { children: "Fotos Descritas" }),
        _jsx(StatNumber, { color: "purple.500", children: d.photosDescribed }),
        _jsxs(StatHelpText, { children: [_jsx(FaEye, {}), " Total acumulado"] })
      ] }) }) }) }),
      _jsx(GridItem, { children: _jsx(Card, { children: _jsx(CardBody, { children: _jsxs(Stat, { children: [
        _jsx(StatLabel, { children: "Línea Base" }),
        _jsxs(StatNumber, { color: "gray.500", children: [d.baselineScore, "%"] }),
        _jsx(StatHelpText, { children: "Puntuación inicial" })
      ] }) }) }) })
    ] }),
    _jsxs(Grid, { templateColumns: "repeat(2, 1fr)", gap: 6, w: "full", children: [
      _jsx(GridItem, { children: _jsx(Card, { children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, children: [
        _jsxs(HStack, { children: [_jsx(FaBrain, {}), _jsx(Text, { fontWeight: "bold", children: "Recall (Memoria)" })] }),
        _jsxs(VStack, { spacing: 2, w: "full", children: [
          _jsxs(HStack, { justify: "space-between", w: "full", children: [_jsx(Text, { fontSize: "sm", children: "Promedio actual" }), _jsxs(Badge, { colorScheme: getScoreColor(d.averageRecall), children: [d.averageRecall, "%"] })] }),
          _jsx(Progress, { value: d.averageRecall, w: "full", colorScheme: getScoreColor(d.averageRecall), size: "lg" }),
          _jsx(Text, { fontSize: "xs", color: "gray.500", children: getScoreLabel(d.averageRecall) })
        ] })
      ] }) }) }) }),
      _jsx(GridItem, { children: _jsx(Card, { children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, children: [
        _jsxs(HStack, { children: [_jsx(FaChartLine, {}), _jsx(Text, { fontWeight: "bold", children: "Coherencia" })] }),
        _jsxs(VStack, { spacing: 2, w: "full", children: [
          _jsxs(HStack, { justify: "space-between", w: "full", children: [_jsx(Text, { fontSize: "sm", children: "Promedio actual" }), _jsxs(Badge, { colorScheme: getScoreColor(d.averageCoherence), children: [d.averageCoherence, "%"] })] }),
          _jsx(Progress, { value: d.averageCoherence, w: "full", colorScheme: getScoreColor(d.averageCoherence), size: "lg" }),
          _jsx(Text, { fontSize: "xs", color: "gray.500", children: getScoreLabel(d.averageCoherence) })
        ] })
      ] }) }) }) })
    ] }),
    _jsx(Card, { w: "full", children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, children: [
      _jsx(Text, { fontWeight: "bold", fontSize: "lg", children: "📈 Comparación con Línea Base" }),
      _jsxs(Grid, { templateColumns: "repeat(3, 1fr)", gap: 4, w: "full", children: [
        _jsxs(Box, { textAlign: "center", children: [_jsx(Text, { fontSize: "sm", color: "gray.600", children: "Línea Base" }), _jsxs(Text, { fontSize: "2xl", fontWeight: "bold", color: "gray.500", children: [d.baselineScore, "%"] })] }),
        _jsxs(Box, { textAlign: "center", children: [_jsx(Text, { fontSize: "sm", color: "gray.600", children: "Actual" }), _jsxs(Text, { fontSize: "2xl", fontWeight: "bold", color: `${getScoreColor(d.currentScore)}.500`, children: [d.currentScore, "%"] })] }),
        _jsxs(Box, { textAlign: "center", children: [_jsx(Text, { fontSize: "sm", color: "gray.600", children: "Diferencia" }), _jsxs(Text, { fontSize: "2xl", fontWeight: "bold", color: getTrendColor(d.trend), children: [d.trend === "up" ? "+" : d.trend === "down" ? "-" : "", Math.abs(d.currentScore - d.baselineScore), "%"] })] })
      ] })
    ] }) }) }),
    _jsx(Card, { w: "full", children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, align: "stretch", children: [
      _jsx(Text, { fontWeight: "bold", fontSize: "lg", children: "💡 Recomendaciones" }),
      d.recommendations.map((rec, i) => (_jsxs(HStack, { spacing: 3, children: [
        _jsx(Badge, { colorScheme: "blue", borderRadius: "full", minW: "20px", textAlign: "center", children: i + 1 }),
        _jsx(Text, { fontSize: "sm", children: rec })
      ] }, i)))
    ] }) }) }),
    _jsx(Card, { w: "full", children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 3, children: [
      _jsx(Text, { fontWeight: "bold", children: "ℹ️ Información del Reporte" }),
      _jsxs(Grid, { templateColumns: "repeat(2, 1fr)", gap: 4, w: "full", fontSize: "sm", color: "gray.600", children: [
        _jsxs(HStack, { children: [_jsx(FaUser, {}), _jsxs(Text, { children: ["Paciente: ", d.patientName] })] }),
        _jsxs(HStack, { children: [_jsx(FaCalendarAlt, {}), _jsxs(Text, { children: ["Última sesión: ", new Date(d.lastSession).toLocaleDateString("es-ES")] })] }),
        _jsxs(HStack, { children: [_jsx(FaChartLine, {}), _jsxs(Text, { children: ["Período: ", d.period] })] }),
        _jsxs(HStack, { children: [_jsx(FaBrain, {}), _jsxs(Text, { children: ["Estado: ", getScoreLabel(d.currentScore)] })] })
      ] })
    ] }) }) })
  ]}));
}
