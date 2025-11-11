import { Box, Heading, Text, Flex, VStack, Card, CardBody, Alert, AlertIcon, Select, FormControl, FormLabel, Input, Textarea, Button, HStack } from "@chakra-ui/react";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { api } from "../../api";
import { PhotoGallery } from "../../components/PhotoGallery/PhotoGallery";
import { PhotoUploader } from "../../components/PhotoUpload/PhotoUploader";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";

export default function PhotosUpload() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientOptions, setPatientOptions] = useState<Array<{ id: string; displayName?: string | null; email?: string | null }>>([]);
  const [patientSearch, setPatientSearch] = useState<string>("");

  // Campos para "Descripción del suceso" (caregiver)
  const [desc, setDesc] = useState({
    title: "",
    events: "",
    people: "",
    places: "",
    emotions: "",
    details: "",
  });
  const [savingDesc, setSavingDesc] = useState(false);

  const canUpload =
    !!user && (hasPermission(user.role, "upload_photos") || hasPermission(user.role, "upload_photos_for_patient"));
  // No demo mode here: require real permissions and real patient selection when appropriate
  const canDescribe = !!user && (hasPermission(user.role, "describe_photos") || hasPermission(user.role, "describe_photos_for_patient"));

  // currentPatientId must be derived from selection or the user's linkedPatientIds; do NOT fall back to a demo id
  const currentPatientId = selectedPatientId || user?.linkedPatientIds?.[0] || null;

  const loadPhotos = async () => {
    try {
      if (!currentPatientId) {
        setPhotos([]);
        return;
      }
      const resp = await api.get(`/photos/patient/${currentPatientId}`);
      setPhotos(resp.data || []);
    } catch (e) {
      console.error("loadPhotos error:", (e as any)?.response?.status, (e as any)?.response?.data || (e as any).message || e);
    }
  };

  useEffect(() => {
    loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, selectedPatientId]);

  const toast = useToast();

  // Buscar/llenar pacientes para cuidador
  useEffect(() => {
    let cancelled = false;
    let timer: any = null;

    const loadForCaregiver = async () => {
      if (!user) return setPatientOptions([]);
      try {
        const caregiverId = String(user.uid || "");
        const resp = await api.get(`/patients/caregiver/${encodeURIComponent(caregiverId)}`);
        const results = resp.data || [];
        const opts = (results as any[])
          .filter((p) => p && p.id)
          .map((p) => ({ id: p.id, displayName: p.displayName || null, email: p.email || null }));
        if (!cancelled) {
          setPatientOptions(opts);
          if (!selectedPatientId && opts.length > 0) setSelectedPatientId(opts[0].id);
        }
      } catch (err) {
        console.error("Failed to load patient options", err);
        if (!cancelled) setPatientOptions([]);
      }
    };

    const searchPatients = async (q: string) => {
      try {
        const resp = await api.get(`/patients?q=${encodeURIComponent(q)}`);
        const results = resp.data || [];
        const opts = (results as any[])
          .filter((p) => p && p.id)
          .map((p) => ({ id: p.id, displayName: p.displayName || null, email: p.email || null }));
        if (!cancelled) {
          setPatientOptions(opts);
          if (opts.length === 1) setSelectedPatientId(opts[0].id);
        }
      } catch (err) {
        console.error("Patient search failed", err);
        if (!cancelled) setPatientOptions([]);
      }
    };

    if (!user || String(user.role || "").toUpperCase() !== "CAREGIVER") {
      setPatientOptions([]);
      return () => {};
    }

    if (patientSearch && String(patientSearch).trim().length >= 2) {
      timer = setTimeout(() => searchPatients(String(patientSearch).trim()), 300);
    } else {
      loadForCaregiver();
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientSearch, user?.uid, user?.linkedPatientIds]);

  const handlePhotoUpload = (files: File[]) => {
    const upload = async () => {
      try {
        // 1) Requerir paciente cuando la subida depende del paciente
        if (!currentPatientId) {
          // show a clear console warning and early return; UI also shows an Alert
          console.warn("No patient selected — cannot upload photos.");
          try {
            toast({ title: "Selecciona un paciente", description: "Debes seleccionar el paciente antes de subir fotos.", status: "error", duration: 4000 });
          } catch (e) {}
          return;
        }

        // 2) Subir foto(s)
        const form = new FormData();
        files.forEach((f) => form.append("files", f));
        form.append("patientId", currentPatientId);
        
        console.log('Uploading photos for patient:', currentPatientId);
        const up = await api.post(`/photos/upload`, form);
  console.log('Upload response:', up.data);
  try { toast({ title: "Fotos subidas", description: `${files.length} archivo(s) subido(s) correctamente.`, status: "success", duration: 3000 }); } catch (e) {}
  // Recargar fotos después de subir y obtener lista actualizada
        await loadPhotos();
        let uploadedPhotoId: string | undefined = up?.data?.[0]?.id || up?.data?.photoId;

        // If backend did not return ids, fetch the latest photos to determine the newly uploaded one
        if (!uploadedPhotoId) {
          try {
            const fresh = await api.get(`/photos/patient/${currentPatientId}`);
            const list = fresh.data || [];
            if (Array.isArray(list) && list.length > 0) uploadedPhotoId = list[0]?.id;
          } catch (err) {
            console.warn('Failed to fetch fresh photos to infer uploaded id', err);
          }
        }

  const hasAnyDesc = desc.title || desc.events || desc.people || desc.places || desc.emotions || desc.details;

        if (uploadedPhotoId && hasAnyDesc) {
          setSavingDesc(true);
          console.log('Saving description for photo:', uploadedPhotoId);
          try {
            await api.post("/descriptions/wizard", {
              patientId: currentPatientId,
              photoId: uploadedPhotoId,
              data: {
                title: desc.title || null,
                events: desc.events || null,
                people: desc.people ? desc.people.split(",").map((s) => s.trim()).filter(Boolean) : [],
                places: desc.places || null,
                emotions: desc.emotions || null,
                details: desc.details || null,
              },
            });

              console.log('Description saved successfully');
              try { toast({ title: "Descripción guardada", description: "La descripción se asoció a la foto correctamente.", status: "success", duration: 3000 }); } catch (e) {}

              // Limpiar el formulario después de guardar exitosamente
              setDesc({ title: "", events: "", people: "", places: "", emotions: "", details: "" });
          } catch (err) {
              console.error('Failed to save description', err);
              try { toast({ title: "Error guardando descripción", description: (err as any)?.response?.data?.error || String(err), status: "error", duration: 5000 }); } catch (e) {}
          }
        } else if (hasAnyDesc && !uploadedPhotoId) {
            console.warn('Description provided but could not determine uploaded photo id');
            try { toast({ title: "Descripción no asociada", description: "No se pudo determinar la foto subida para asociar la descripción. Revisa la respuesta del servidor.", status: "warning", duration: 5000 }); } catch (e) {}
        }
      } catch (e) {
          console.error("Upload failed", e);
          try { toast({ title: "Error al subir fotos", description: (e as any)?.response?.data?.error || String(e), status: "error", duration: 5000 }); } catch (e) {}
      } finally {
        setSavingDesc(false);
      }
    };
    upload();
  };

  if (!canUpload) {
    return (
      <Box>
        <Navbar />
        <Flex direction={{ base: "column", md: "row" }}>
          <Sidebar />
          <Box flex="1" p={{ base: 4, md: 6 }}>
            <Alert status="warning">
              <AlertIcon />
              No tienes permisos para subir fotos con tu rol actual.
            </Alert>
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }}>
          <Box className="portal">
            <VStack spacing={6} align="stretch">
              <Box>
              <Heading mb={2}>📸 Subir Fotos Familiares</Heading>
              <Text color="blue.600">Sube fotos y agrega la “descripción del suceso”. Esto definirá las respuestas de referencia del cuidador.</Text>
            </Box>

            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {user && canDescribe && (
                    <FormControl>
                      <FormLabel>Subir para paciente</FormLabel>
                      <Input
                        aria-label="Buscar paciente por nombre o correo"
                        value={patientSearch}
                        onChange={(e: any) => setPatientSearch(e.target.value)}
                        mb={2}
                      />
                      <Select
                        placeholder="Selecciona paciente"
                        value={selectedPatientId || ""}
                        onChange={(e) => setSelectedPatientId(e.target.value || null)}
                      >
                        {patientOptions.length === 0 ? (
                          <option value="">(No hay pacientes disponibles)</option>
                        ) : (
                          patientOptions.map((p) => {
                            const display = p.displayName || p.email || p.id;
                            const shortId = p.id ? ` (${String(p.id).slice(0, 8)})` : "";
                            return (
                              <option key={p.id} value={p.id}>
                                {display}{shortId}
                              </option>
                            );
                          })
                        )}
                      </Select>
                      {selectedPatientId && (
                        <Text fontSize="sm" color="gray.500" mt={2}>
                          UID seleccionado: {selectedPatientId}
                        </Text>
                      )}
                    </FormControl>
                  )}

                  <PhotoUploader
                    onUpload={handlePhotoUpload}
                    maxFiles={10}
                    maxSizeMB={5}
                    acceptedFormats={["image/jpeg", "image/jpg", "image/png"]}
                  />
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Galería</Heading>
                <PhotoGallery photos={photos} canEdit={false} canDelete={false} />
              </CardBody>
            </Card>
            </VStack>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
