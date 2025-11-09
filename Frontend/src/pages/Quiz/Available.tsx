import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
} from '@chakra-ui/react';
import { Navbar } from '../../components/Layout/Navbar';
import { Sidebar } from '../../components/Layout/Sidebar';
import { AvailableQuizzes } from '../../components/Quiz/AvailableQuizzes';

export default function AvailableQuizzesPage() {
  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <Box mb={6}>
            <Heading size="lg" color="blue.700">Mis Cuestionarios</Heading>
            <Text color="blue.600">
              Aquí encontrarás todos los cuestionarios disponibles para tomar
            </Text>
          </Box>

          <AvailableQuizzes />
        </Box>
      </Flex>
    </Box>
  );
}