// src/components/Layout/AuthenticatedLayout.tsx
import { Box, Flex } from "@chakra-ui/react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box>
      <Navbar />
      <Flex>
        <Box 
          width="240px" 
          position="fixed"
          left={0}
          top="72px"
          bottom={0}
          px={4}
          py={6}
          borderRight="1px"
          borderColor="gray.200"
          bg="white"
        >
          <Sidebar />
        </Box>
        <Box flex="1" ml="240px" p={6}>
          {children}
        </Box>
      </Flex>
    </Box>
  );
}