import { Box, Heading, Text, Flex } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";

export default function PhotosTagger() {
  return (
    <Box>
      <Navbar />
      <Flex>
        <Sidebar />
        <Box flex="1" p={6}>
          <Heading mb={6}>Etiquetar Fotos</Heading>
          <Text>TODO: Herramienta de etiquetado</Text>
        </Box>
      </Flex>
    </Box>
  );
}