import { Box, Flex, Heading, Button, Spacer } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("demo-user");
    navigate("/login");
  };

  return (
    <Box bg="blue.500" color="white" p={4}>
      <Flex align="center">
        <Heading size="md">🧠 DoYouRemember</Heading>
        <Spacer />
        <Button variant="outline" colorScheme="white" onClick={handleSignOut}>
          Cerrar sesión
        </Button>
      </Flex>
    </Box>
  );
}