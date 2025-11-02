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
    <Box bg="blue.500" color="white" p={4}>
      <Flex align="center">
        <Heading size="md">DoYouRemember</Heading>
        <Spacer />
        <Button variant="outline" colorScheme="whiteAlpha" onClick={handleSignOut}>
          Cerrar sesión
        </Button>
      </Flex>
    </Box>
  );
}
