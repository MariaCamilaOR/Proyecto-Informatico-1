import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { Box, Heading, Text, VStack, Card, CardBody, HStack, Avatar, Button, Checkbox, Textarea, useToast, Divider } from "@chakra-ui/react";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [patient, setPatient] = useState<any | null>(null);
  const [descriptions, setDescriptions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [baseline, setBaseline] = useState("");
  const [message, setMessage] = useState("");
  const toast = useToast();

  const load = async () => {
    if (!id) return;
    try {
      const p = await api.get(`/patients/${id}`);
      setPatient(p.data);
    } catch (e) {
      console.error("Failed to load patient", e);
    }
    try {
      const d = await api.get(`/descriptions/patient/${id}`);
      setDescriptions(d.data || []);
    } catch (e) {
      console.error("Failed to load descriptions", e);
    }
    try {
      const r = await api.get(`/reports/patient/${id}`);
      setReports(r.data || []);
    } catch (e) {
      console.error("Failed to load reports", e);
    }
  };

  useEffect(() => { load(); }, [id]);

  const toggle = (descId: string) => setSelected((s) => ({ ...s, [descId]: !s[descId] }));

  const handleCreateReport = async () => {
    if (!id) return;
    // gather selected descriptions
    const selectedList = descriptions.filter((d) => selected[d.id]);
    if (selectedList.length === 0 && !baseline) {
      toast({ title: "Nada seleccionado", description: "Selecciona al menos una descripción o escribe una línea base.", status: "warning" });
      return;
    }

    try {
      const payload = { patientId: id, data: { descriptions: selectedList, createdBy: user?.uid }, baseline };
      await api.post(`/reports`, payload);
      toast({ title: "Reporte creado", status: "success" });
      // refresh reports
      const r = await api.get(`/reports/patient/${id}`);
      setReports(r.data || []);
    } catch (e) {
      console.error("Failed to create report", e);
      toast({ title: "Error", description: "No se pudo crear el reporte.", status: "error" });
    }
  };

  const handleRequestBaseline = async () => {
    if (!id) return;
    try {
      await api.post(`/notifications`, { patientId: id, type: "baseline_request", message });
      toast({ title: "Solicitud enviada", description: "Se solicitó al paciente que establezca una línea base.", status: "success" });
      setMessage("");
    } catch (e) {
      console.error("Failed to send notification", e);
      toast({ title: "Error", description: "No se pudo enviar la solicitud.", status: "error" });
    }
  };

  return (
    <Box>
      <Navbar />
      <HStack spacing={0} align="stretch">
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <VStack align="stretch" spacing={6}>
            <Heading>Paciente: {patient?.displayName || patient?.email || id}</Heading>

            <Card><CardBody>
              <Heading size="sm">Descripciones del paciente</Heading>
              <Text fontSize="sm" color="gray.600">Selecciona las descripciones que quieras incluir en un reporte.</Text>
              <VStack align="stretch" mt={3}>
                {descriptions.length === 0 ? <Text>No hay descripciones.</Text> : descriptions.map((d) => (
                  <Card key={d.id}><CardBody>
                    <HStack align="start" justify="space-between">
                      <HStack>
                        <Avatar name={d.authorUid || 'Paciente'} size="sm" />
                        <Box>
                          <Text fontWeight="bold">{d.type || 'descripcion'}</Text>
                          <Text fontSize="sm">{d.type === 'text' ? d.description : JSON.stringify(d.data)}</Text>
                        </Box>
                      </HStack>
                      <Checkbox isChecked={!!selected[d.id]} onChange={() => toggle(d.id)}>Incluir</Checkbox>
                    </HStack>
                  </CardBody></Card>
                ))}
              </VStack>
              <Divider my={4} />
              <Heading size="sm">Crear Reporte</Heading>
              <Text fontSize="sm" color="gray.600">Puedes incluir las descripciones seleccionadas y/o una línea base.</Text>
              <Textarea mt={2} placeholder="Línea base (opcional)" value={baseline} onChange={(e) => setBaseline(e.target.value)} />
              <HStack justify="flex-end" mt={3}>
                <Button colorScheme="green" onClick={handleCreateReport}>Crear Reporte</Button>
              </HStack>
            </CardBody></Card>

            <Card><CardBody>
              <Heading size="sm">Solicitar Línea Base</Heading>
              <Text fontSize="sm" color="gray.600">Envía una solicitud al paciente para que complete una línea base que puedas usar en futuros reportes.</Text>
              <Textarea mt={2} placeholder="Mensaje al paciente (opcional)" value={message} onChange={(e) => setMessage(e.target.value)} />
              <HStack justify="flex-end" mt={3}>
                <Button colorScheme="blue" onClick={handleRequestBaseline}>Solicitar Línea Base</Button>
              </HStack>
            </CardBody></Card>

            <Card><CardBody>
              <Heading size="sm">Reportes previos</Heading>
              {reports.length === 0 ? <Text>No hay reportes.</Text> : (
                <VStack align="stretch">
                  {reports.map((r) => (
                    <Card key={r.id}><CardBody>
                      <Text fontWeight="bold">{new Date(r.createdAt?.toDate ? r.createdAt.toDate() : r.createdAt).toLocaleString()}</Text>
                      <Text fontSize="sm">{JSON.stringify(r.data)}</Text>
                    </CardBody></Card>
                  ))}
                </VStack>
              )}
            </CardBody></Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
}
