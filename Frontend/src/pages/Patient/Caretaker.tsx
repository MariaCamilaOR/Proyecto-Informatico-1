import { Box, Heading, Text, Flex, Card, CardBody, VStack, Avatar, Button, Spinner } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { api } from "../../api";

export default function PatientCaretaker() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [caregiver, setCaregiver] = useState<any | null>(null);
  const [patientData, setPatientData] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (!user) return;
        const patientId = user.linkedPatientIds?.[0] || user.uid;
        const pResp = await api.get(`/patients/${patientId}`);
        const p = pResp.data;
        setPatientData(p);
        const caregiverId = p?.assignedCaregiverId || null;
        if (caregiverId) {
          const cResp = await api.get(`/users/${caregiverId}`);
          setCaregiver(cResp.data);
        } else {
          setCaregiver(null);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Failed to load caregiver info", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.uid]);

  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading mb={2}>Mi cuidador</Heading>
              <Text color="blue.600">Aquí verás la información de la persona asignada como tu cuidador.</Text>
            </Box>

            {loading ? (
              <Card>
                <CardBody>
                  <Spinner />
                </CardBody>
              </Card>
            ) : (
              <>
                {!caregiver ? (
                  <Card>
                    <CardBody>
                      <Text>No tienes un cuidador asignado aún. Pide a tu cuidador que use tu código de invitación para agregarte.</Text>
                      <Text mt={2} fontSize="sm" color="gray.600">Tu código: <Box as="span" fontFamily="mono">{user?.inviteCode || user?.uid}</Box></Text>
                    </CardBody>
                  </Card>
                ) : (
                  <Card>
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <Avatar name={caregiver.displayName || caregiver.id} size="lg" />
                        <Heading size="md">{caregiver.displayName || caregiver.id}</Heading>
                        <Text color="blue.600">{caregiver.email || "—"}</Text>
                        <Text fontSize="sm" color="gray.600">ID: {caregiver.id}</Text>
                        <Button onClick={() => window.location.href = `mailto:${caregiver.email}`} colorScheme="blue">Contactar</Button>
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </>
            )}
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
