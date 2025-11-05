import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Heading, Text, Flex, VStack, Alert, AlertIcon, Card, CardBody, HStack, Progress } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { SimpleReport } from "../../components/Reports/SimpleReport";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission, normalizeRole } from "../../lib/roles";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuizzes } from "../../hooks/useQuizzes";

export default function ReportsTrends() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const [sp] = useSearchParams();
  const patientId = sp.get("patientId") || (role === "PATIENT" ? user?.uid : null);

  const { listByPatient } = useQuizzes();
  const [quizzes, setQuizzes] = useState([]);

  const canViewReports = !!user &&
    (hasPermission(user.role, "view_own_reports") ||
     hasPermission(user.role, "view_patient_reports") ||
     hasPermission(user.role, "view_detailed_analytics"));

  useEffect(() => {
    if (!patientId) return;
    listByPatient(patientId).then(setQuizzes).catch(()=>{});
  }, [patientId]);

  const recallPct = useMemo(() => {
    const completed = (quizzes || []).filter(q => q.status === "completed");
    if (!completed.length) return 0;
    const avg = completed.reduce((a,q)=> a + (q.score || 0), 0) / completed.length;
    return Math.round(avg * 100);
  }, [quizzes]);

  if (!canViewReports) {
    return (_jsxs(Box, { children: [_jsx(Navbar, {}), _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [_jsx(Sidebar, {}), _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children: _jsxs(Alert, { status: "warning", children: [_jsx(AlertIcon, {}), "No tienes permisos para ver reportes con tu rol actual."] }) })] })] }));
  }

  const canExport = role === "DOCTOR";
  const canShare = role === "DOCTOR" || role === "CAREGIVER";

  return (_jsxs(Box, { children: [
    _jsx(Navbar, {}),
    _jsxs(Flex, { direction: { base: "column", md: "row" }, children: [
      _jsx(Sidebar, {}),
      _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children:
        _jsxs(VStack, { spacing: 6, align: "stretch", children: [
          _jsxs(Box, { children: [_jsx(Heading, { mb: 2, color: "blue.700", children: "📈 Tendencias y Progreso" }), _jsx(Text, { color: "blue.600", children: "Monitorea el progreso y compáralo con la línea base." })] }),

          _jsx(Card, { children: _jsxs(CardBody, { children: [
            _jsxs(HStack, { justify: "space-between", mb: 2, children: [
              _jsx(Text, { fontWeight: "bold", children: "Recall (Memoria) promedio" }),
              _jsx(Text, { children: `${recallPct}%` })
            ]}),
            _jsx(Progress, { value: recallPct })
          ]}) }),

          _jsx(SimpleReport, { canExport: canExport, canShare: canShare })
        ]})
      })
    ]})
  ]}));
}
