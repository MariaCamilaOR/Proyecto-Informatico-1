// src/components/Layout/Navbar.tsx
import { Box, Flex, Heading, Button, Spacer } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import { logoutFirebase } from "../../store/thunks/authThunks";

export function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSignOut = async () => {
    try {
      await dispatch(logoutFirebase());
    } finally {
      // por si quedaba algo del modo demo
      localStorage.removeItem("demo-user");
      localStorage.removeItem("demo-role");
      navigate("/login", { replace: true });
    }
  };

  return (
    <Box 
      bgGradient="linear(to-br, blue.50, white)"
      color="blue.700" 
      p={4}
      borderBottom="2px solid"
      borderColor="blue.200"
      boxShadow="0 2px 8px rgba(25, 118, 210, 0.1)"
    >
      <Flex align="center">
        <Heading size="md" color="blue.700">DoYouRemember</Heading>
        <Spacer />
        <Button 
          variant="outline" 
          colorScheme="blue" 
          borderColor="blue.500"
          color="blue.600"
          onClick={handleSignOut}
          _hover={{
            bg: "blue.50",
            borderColor: "blue.600",
            color: "blue.700"
          }}
        >
          Cerrar sesión
        </Button>
      </Flex>
    </Box>
  );
}
