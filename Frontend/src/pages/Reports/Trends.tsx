import { Box, Heading, Text, Flex, VStack, Alert, AlertIcon } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { SimpleReport } from "../../components/Reports/SimpleReport";
import { useEffect, useState } from "react";
import { api } from "../../api";
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
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadPatients = async () => {
      if (role !== "DOCTOR") return;
      try {
        const resp = await api.get(`/patients/doctor/${user?.uid}`);
        setPatients(resp.data || []);
        if ((resp.data || []).length > 0) setSelectedPatientId(resp.data[0].id);
      } catch (err) {
        console.error("Failed to load doctor patients", err);
      }
    };
    loadPatients();
  }, [role, user?.uid]);

  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading mb={2} color="blue.700">📈 Tendencias y Progreso</Heading>
              <Text color="blue.600">Monitorea el progreso y compáralo con la línea base.</Text>
            </Box>
            {role === "DOCTOR" && (
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>Seleccionar paciente</Text>
                <select value={selectedPatientId || ""} onChange={(e) => setSelectedPatientId(e.target.value || undefined)} style={{ padding: 8, borderRadius: 6 }}>
                  <option value="">-- Seleccione un paciente --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.displayName || p.email || p.id}</option>
                  ))}
                </select>
              </Box>
            )}

            <SimpleReport
              patientId={selectedPatientId}
              canExport={canExport}
              canShare={canShare}
            />
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
