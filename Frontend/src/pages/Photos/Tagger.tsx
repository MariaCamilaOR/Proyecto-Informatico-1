import { Box, Heading, Text, Flex } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";

export default function PhotosTagger() {
  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <Heading mb={6}>Etiquetar Fotos</Heading>
          <Text>TODO: Herramienta de etiquetado</Text>
        </Box>
      </Flex>
    </Box>
  );
}