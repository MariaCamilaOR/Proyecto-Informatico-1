import { Box, Heading, Text, Flex, VStack, Card, CardBody, Alert, AlertIcon, Select, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { PhotoGallery } from "../../components/PhotoGallery/PhotoGallery";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { PhotoUploader } from "../../components/PhotoUpload/PhotoUploader";
import { useAuth } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/roles";

export default function PhotosUpload() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientOptions, setPatientOptions] = useState<Array<{ id: string; displayName?: string | null; email?: string | null }>>([]);
  const [patientSearch, setPatientSearch] = useState<string>("");

  const canUpload =
    !!user && (hasPermission(user.role, "upload_photos") || hasPermission(user.role, "upload_photos_for_patient"));

  const loadPhotos = async () => {
    try {
      const patientId = selectedPatientId || user?.linkedPatientIds?.[0] || "demo-patient-123";
      const resp = await api.get(`/photos/patient/${patientId}`);
      setPhotos(resp.data || []);
    } catch (e) {
      console.error("loadPhotos error:", (e as any)?.response?.status, (e as any)?.response?.data || (e as any).message || e);
    }
  };

  useEffect(() => {
    loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, selectedPatientId]);

  // Load patient display names. Support two modes:
  // - When the caregiver types in the search box (patientSearch), query the global /patients?q=... endpoint
  //   so caregivers can look up patients by name or email and still receive the patient's UID for uploads.
  // - When the search box is empty, fall back to the caregiver-specific endpoint to list assigned patients.
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
        const uidStr = String(user.uid || "").trim();
        const userEmail = String(user.email || "").toLowerCase();
        const finalOpts = opts.filter((o) => String(o.id || "").trim() !== uidStr && String(o.email || "").toLowerCase() !== userEmail);
        if (!cancelled) {
          setPatientOptions(finalOpts);
          if (!selectedPatientId && finalOpts.length > 0) setSelectedPatientId(finalOpts[0].id);
        }
      } catch (err) {
        console.error("Failed to load patient options", err);
        if (!cancelled) setPatientOptions([]);
      }
    };

    const searchPatients = async (q: string) => {
      try {
        // backend supports ?q= for partial matching on name/email
        const resp = await api.get(`/patients?q=${encodeURIComponent(q)}`);
        const results = resp.data || [];
        const opts = (results as any[])
          .filter((p) => p && p.id)
          .map((p) => ({ id: p.id, displayName: p.displayName || null, email: p.email || null }));
        if (!cancelled) {
          setPatientOptions(opts);
          // if the search yields a single clear match, pre-select it; otherwise don't change selection
          if (opts.length === 1) setSelectedPatientId(opts[0].id);
        }
      } catch (err) {
        console.error("Patient search failed", err);
        if (!cancelled) setPatientOptions([]);
      }
    };

    // only apply this behavior to caregivers
    if (!user || String(user.role || "").toUpperCase() !== "CAREGIVER") {
      setPatientOptions([]);
      return () => {};
    }

    // Debounce search input to avoid flooding the backend
    if (patientSearch && String(patientSearch).trim().length >= 2) {
      timer = setTimeout(() => searchPatients(String(patientSearch).trim()), 300);
    } else {
      // empty search => load caregiver's linked patients
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
        const form = new FormData();
        files.forEach((f) => form.append("files", f));
        const patientId = selectedPatientId || user?.linkedPatientIds?.[0] || "demo-patient-123";
        form.append("patientId", patientId);

        await api.post(`/photos/upload`, form);
        await loadPhotos();
      } catch (e) {
        console.error("Upload failed", e);
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
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading mb={2}>📸 Subir Fotos Familiares</Heading>
              <Text color="blue.600">Sube fotos de familia, amigos y lugares importantes.</Text>
            </Box>

            <Card>
              <CardBody>
                <VStack spacing={4}>
                  {/* If caregiver, allow selecting which patient to upload for */}
                  {user && String(user.role || "").toUpperCase() === "CAREGIVER" && (
                    <FormControl>
                      <FormLabel>Subir para paciente</FormLabel>
                      {/* Search input (visible) and select below */}
                      <Box mb={2}>
                        <Input
                          aria-label="Buscar paciente por nombre o correo"
                          value={patientSearch}
                          onChange={(e: any) => setPatientSearch(e.target.value)}
                          mb={2}
                        />
                      </Box>
                        <Select placeholder="Selecciona paciente" value={selectedPatientId || ''} onChange={(e) => setSelectedPatientId(e.target.value || null)}>
                          {patientOptions.length === 0 ? (
                            <option value="">(No hay pacientes disponibles)</option>
                          ) : (
                            (() => {
                              const uidStr = String(user?.uid || "").trim().toLowerCase();
                              const filtered = patientOptions
                                .filter((p) => String(p.id || "").trim().toLowerCase() !== uidStr)
                                .filter((p) => {
                                  if (!patientSearch) return true;
                                  const q = patientSearch.toLowerCase();
                                  // Search only by name or email for easier human lookup
                                  return (
                                    String(p.displayName || "").toLowerCase().includes(q) ||
                                    String(p.email || "").toLowerCase().includes(q)
                                  );
                                });
                              return filtered.map((p) => {
                                const display = p.displayName || p.email || p.id;
                                const emailPart = p.email ? ` — ${p.email}` : "";
                                const shortId = p.id ? ` (${String(p.id).slice(0, 8)})` : "";
                                return (
                                  <option key={p.id} value={p.id}>
                                    {p.displayName ? `${p.displayName}${emailPart}${shortId}` : `${display}`}
                                  </option>
                                );
                              });
                            })()
                          )}
                        </Select>
                        {/* Show full UID for clarity when a patient is selected */}
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
                <Heading size="md" mb={4}>📚 Galería</Heading>
                <PhotoGallery photos={photos} canEdit={false} canDelete={false} />
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
