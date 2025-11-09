// src/components/Layout/Navbar.tsx
import { Box, Flex, Heading, Button, Spacer, HStack, Text, IconButton, useToast } from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { useAuth } from "../../hooks/useAuth";
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
      className="dyr-navbar"
      bgGradient="linear(to-br, blue.50, white)"
      color="blue.700" 
      p={4}
      borderBottom="2px solid"
      borderColor="blue.200"
      boxShadow="0 2px 8px rgba(25, 118, 210, 0.06)"
    >
      <Flex align="center">
        <Heading size="md" color="blue.700">DoYouRemember</Heading>
        <Spacer />
        {/* Show invite code for patients */}
        <InviteCodeDisplay />
        {/* If caregiver, show quick link to describe photos */}
        <NavActions />
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

function InviteCodeDisplay() {
  const { user } = useAuth();
  const toast = useToast();

  if (!user) return null;
  if (!user.role || user.role.toLowerCase() !== "patient") return null;
  const code = user.inviteCode || user.uid;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code ?? "");
      toast({ title: "Código copiado", status: "success", duration: 2000, isClosable: true });
    } catch (e) {
      toast({ title: "No se pudo copiar", status: "error", duration: 2000, isClosable: true });
    }
  };

  return (
    <HStack spacing={3} mr={4}>
      <Text fontSize="sm" color="blue.600">Invitación:</Text>
      <Box as="code" px={3} py={1} bg="blue.50" borderRadius="md" fontFamily="mono" color="blue.700" fontSize="sm">
        {code}
      </Box>
      <IconButton aria-label="Copiar código" icon={<CopyIcon />} size="sm" onClick={handleCopy} />
    </HStack>
  );
}

function NavActions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const role = user.role;
  if (role !== "CAREGIVER") return null;

  return (
    <Button mr={3} colorScheme="teal" variant="ghost" onClick={() => navigate('/cuidador/describir')}>
      Describir fotos
    </Button>
  );
}
