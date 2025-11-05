// src/components/Layout/Sidebar.tsx
import { Box, VStack, Link as CLink, Text } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { normalizeRole } from "../../lib/roles";

type MenuItem = { path: string; label: string };

export function Sidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const role = normalizeRole(user?.role as any);

  // Base y menús por rol
  const base: MenuItem[] = [{ path: "/", label: "Dashboard" }];

  const byRole: Record<NonNullable<typeof role>, MenuItem[]> = {
    PATIENT: [
      ...base,
      { path: "/photos", label: "Fotos" },
      { path: "/patient/gallery", label: "Galería" },
      { path: "/describe/wizard", label: "Describir" },
      { path: "/quiz/results", label: "Cuestionarios" },
      { path: "/alerts", label: "Alertas" },
      { path: "/reminders", label: "Recordatorios" },
    ],
    CAREGIVER: [
      ...base,
      { path: "/photos", label: "Fotos" },
      { path: "/cuidador/photos/upload", label: "Subir Fotos" },
      { path: "/caregivers/patients", label: "Mis Pacientes" },
      { path: "/caregivers/manage", label: "Gestionar Cuidadores" },
      { path: "/alerts", label: "Alertas" },
      { path: "/reminders", label: "Recordatorios" },
    ],
    DOCTOR: [
      ...base,
      { path: "/doctors/patients", label: "Pacientes" },
      { path: "/doctors/mis-pacientes", label: "Mis Pacientes" },
      { path: "/reports", label: "Reportes" },
      { path: "/alerts", label: "Alertas" },
    ],
  };

  // Si no hay rol aún (cargando), muestra base; si hay rol usa su menú
  const menuItems: MenuItem[] = role ? byRole[role] : base;

  // Activo: caso especial para agrupar todas las rutas de /quiz/*
  const isActive = (path: string) => {
    if (path === "/quiz/results") return pathname.startsWith("/quiz");
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <Box className="dyr-sidebar">
      <VStack spacing={6} align="stretch">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <CLink
              key={item.path}
              as={RouterLink}
              to={item.path}
              className={active ? "active" : ""}
              _hover={{ textDecoration: "none" }}
            >
              <Text fontWeight={active ? "bold" : "normal"}>
                {item.label}
              </Text>
            </CLink>
          );
        })}
      </VStack>
    </Box>
  );
}
