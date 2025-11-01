import { Button, Container, Heading, VStack, Text, Box, Select, FormControl, FormLabel, HStack, Badge, Input } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ROLES } from "../lib/roles";
import type { Role } from "../types/auth";

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>(ROLES.PATIENT);

  const handleDemoLogin = () => {
    // Simular login exitoso con rol seleccionado
    localStorage.setItem("demo-user", "true");
    localStorage.setItem("demo-role", selectedRole);
    navigate("/");
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenClaims, setTokenClaims] = useState<any | null>(null);
  const [tokenInfo, setTokenInfo] = useState<{ idToken: string; uid: string } | null>(null);

  const handleEmailSignIn = async () => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Ensure token/claims are available before navigating
      try {
        const tokenResult = await cred.user.getIdTokenResult(true);
        console.log("ID token claims:", tokenResult.claims);
      } catch (e) {
        console.warn("Could not read token claims immediately", e);
      }
  // navigate to homepage after successful sign in
      // Instead of navigating immediately, show claims so you can verify them.
      const tokenResult = await cred.user.getIdTokenResult(true);
      setTokenClaims(tokenResult.claims || {});
      setTokenInfo({ idToken: await cred.user.getIdToken(), uid: cred.user.uid });
      // Do not auto-navigate; user can press continue when ready.
    } catch (e) {
      console.error("Login failed", e);
      alert("Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleDescription = (role: Role) => {
    switch (role) {
      case ROLES.PATIENT:
        return "Paciente que describe fotos y recibe recordatorios";
      case ROLES.CAREGIVER:
        return "Cuidador que sube fotos y monitorea al paciente";
      case ROLES.DOCTOR:
        return "Médico que analiza reportes y configura alertas";
      default:
        return "";
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case ROLES.PATIENT:
        return "👤";
      case ROLES.CAREGIVER:
        return "👨‍👩‍👧‍👦";
      case ROLES.DOCTOR:
        return "👩‍⚕️";
      default:
        return "👤";
    }
  };

  return (
    <Container maxW="md" py={16}>
      <VStack spacing={6}>
        <Box textAlign="center">
          <Heading size="lg" color="blue.500" mb={2}>
            🧠 DoYouRemember
          </Heading>
          <Text color="gray.600" mb={6}>
            Detección temprana de Alzheimer
          </Text>
        </Box>
        
        <Heading size="md">Iniciar sesión</Heading>
        
        <VStack spacing={4} w="full">
          {/* Email sign-in */}
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="email@example.com" />
          </FormControl>
          <FormControl>
            <FormLabel>Contraseña</FormLabel>
            <Input type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} placeholder="********" />
          </FormControl>
          <Button colorScheme="green" size="md" w="full" isLoading={loading} onClick={handleEmailSignIn}>Iniciar con email</Button>

          <FormControl>
            <FormLabel>Selecciona tu rol para la demo:</FormLabel>
            <Select 
              value={selectedRole} 
              onChange={(e) => setSelectedRole(e.target.value as Role)}
            >
              <option value={ROLES.PATIENT}>👤 Paciente</option>
              <option value={ROLES.CAREGIVER}>👨‍👩‍👧‍👦 Cuidador</option>
              <option value={ROLES.DOCTOR}>👩‍⚕️ Médico</option>
            </Select>
          </FormControl>

          <Box p={4} bg="gray.50" borderRadius="md" w="full">
            <HStack>
              <Text fontSize="2xl">{getRoleIcon(selectedRole)}</Text>
              <VStack align="start" spacing={1}>
                <HStack>
                  <Text fontWeight="bold" textTransform="capitalize">{selectedRole}</Text>
                  <Badge colorScheme="blue">Demo</Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {getRoleDescription(selectedRole)}
                </Text>
              </VStack>
            </HStack>
          </Box>
          
          <Button 
            colorScheme="blue" 
            size="lg" 
            w="full"
            onClick={handleDemoLogin}
          >
            🚀 Entrar como {selectedRole}
          </Button>

          {tokenClaims && (
            <Box w="full" p={3} bg="gray.50" borderRadius="md">
              <Heading size="sm">Token claims (inspecciona antes de continuar)</Heading>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(tokenClaims, null, 2)}</pre>
              <Text fontSize="xs" color="gray.600">UID: {tokenInfo?.uid}</Text>
              <HStack mt={2}>
                <Button colorScheme="blue" size="sm" onClick={() => navigate('/')}>Continuar al dashboard</Button>
              </HStack>
            </Box>
          )}
          
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Esta es una versión de demostración. 
            <br />
            Selecciona un rol y explora las funcionalidades correspondientes.
          </Text>
        </VStack>
      </VStack>
    </Container>
  );
}