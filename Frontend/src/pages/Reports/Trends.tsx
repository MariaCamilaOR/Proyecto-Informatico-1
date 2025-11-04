import { Box, Heading, Text, Flex, VStack, Alert, AlertIcon } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { SimpleReport } from "../../components/Reports/SimpleReport";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission, normalizeRole } from "../../lib/roles";

export default function ReportsTrends() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role as any);

  // Paciente ve sus reportes; cuidador/médico ven reportes de pacientes
  const canViewReports =
    !!user &&
    (hasPermission(user.role, "view_own_reports") ||
      hasPermission(user.role, "view_patient_reports") ||
      hasPermission(user.role, "view_detailed_analytics"));

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

  const canExport = role === "DOCTOR";
  const canShare = role === "DOCTOR" || role === "CAREGIVER";

  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading mb={2} color="whiteAlpha.900">📈 Tendencias y Progreso</Heading>
              <Text color="gray.300">Monitorea el progreso y compáralo con la línea base.</Text>
            </Box>

            <SimpleReport
              canExport={canExport}
              canShare={canShare}
            />
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
