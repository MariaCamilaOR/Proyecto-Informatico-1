import { Box, Heading, Text, Flex } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";

export default function ReportsDetail() {
  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <Heading mb={2} color="whiteAlpha.900">Detalle del Reporte</Heading>
          <Text color="gray.300">TODO: Vista detallada de un reporte específico.</Text>
        </Box>
      </Flex>
    </Box>
  );
}
