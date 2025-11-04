import { Box, Heading, Text, Flex } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";

export default function AlertsSettings() {
  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <Heading mb={6}>Configuración de Alertas</Heading>
          <Text>TODO: Configurar umbrales y notificaciones</Text>
        </Box>
      </Flex>
    </Box>
  );
}