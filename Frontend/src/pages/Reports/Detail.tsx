import { Box, Heading, Text, Flex } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";

export default function ReportsDetail() {
  return (
    <Box>
      <Navbar />
      <Flex>
        <Sidebar />
        <Box flex="1" p={6}>
          <Heading mb={6}>Detalle del Reporte</Heading>
          <Text>TODO: Vista detallada de un reporte específico</Text>
        </Box>
      </Flex>
    </Box>
  );
}