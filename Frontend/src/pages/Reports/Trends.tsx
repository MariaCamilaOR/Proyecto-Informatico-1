import { Box, Heading, Text, Flex, VStack, Alert, AlertIcon } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { SimpleReport } from "../../components/Reports/SimpleReport";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";

export default function ReportsTrends() {
  const { user } = useAuth();

  const canViewReports = user && hasPermission(user.role, "view_own_reports");

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
            <Box>
              <Heading mb={2}>📈 Tendencias y Progreso</Heading>
              <Text color="gray.600">
                Monitorea tu progreso y compara con tu línea base
              </Text>
            </Box>

            <SimpleReport
              reportData={undefined} // Usará datos demo
              canExport={user?.role === "doctor"}
              canShare={user?.role === "caregiver" || user?.role === "doctor"}
            />
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}