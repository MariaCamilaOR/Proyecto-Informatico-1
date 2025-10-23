import { Box, Heading, Text, Flex } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";

export default function DescribeText() {
  return (
    <Box>
      <Navbar />
      <Flex>
        <Sidebar />
        <Box flex="1" p={6}>
          <Heading mb={6}>Describir por Texto</Heading>
          <Text>TODO: Formulario de descripción por texto</Text>
        </Box>
      </Flex>
    </Box>
  );
}