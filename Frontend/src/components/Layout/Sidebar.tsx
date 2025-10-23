import { Box, VStack, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";

const menuItems = [
  { path: "/", label: "Dashboard" },
  { path: "/photos", label: "Fotos" },
  { path: "/describe", label: "Describir" },
  { path: "/reports", label: "Reportes" },
  { path: "/caregivers/manage", label: "Gestionar Cuidadores" },
  { path: "/caregivers/patients", label: "Mis Pacientes" },
  { path: "/alerts", label: "Alertas" },
  { path: "/reminders", label: "Recordatorios" }
];

export function Sidebar() {
  const location = useLocation();

  return (
    <Box w="250px" bg="gray.100" p={4} minH="100vh">
      <VStack spacing={4} align="stretch">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            as={RouterLink}
            to={item.path}
            color={location.pathname === item.path ? "blue.500" : "gray.700"}
            fontWeight={location.pathname === item.path ? "bold" : "normal"}
          >
            <Text>{item.label}</Text>
          </Link>
        ))}
      </VStack>
    </Box>
  );
}