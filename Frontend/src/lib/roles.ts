
export type Role = "PATIENT" | "CAREGIVER" | "DOCTOR";

export const roleLabels: Record<Role, string> = {
  PATIENT: "Paciente",
  CAREGIVER: "Cuidador",
  DOCTOR: "Médico",
};

export const ROLES: Record<Role, Role> = {
  PATIENT: "PATIENT",
  CAREGIVER: "CAREGIVER",
  DOCTOR: "DOCTOR",
} as const;

/** Acepta valores legacy/minúscula y devuelve el rol canónico */
export function normalizeRole(r?: string | null): Role | undefined {
  if (!r) return undefined;
  const v = r.trim().toUpperCase();
  if (v === "PATIENT" || v === "CAREGIVER" || v === "DOCTOR") return v as Role;
  if (r === "patient") return "PATIENT";
  if (r === "caregiver") return "CAREGIVER";
  if (r === "doctor") return "DOCTOR";
  return undefined;
}

export function isRole(r: unknown): r is Role {
  const v = normalizeRole(String(r));
  return v === "PATIENT" || v === "CAREGIVER" || v === "DOCTOR";
}

/** Ruta de portal por rol */
export function routeByRole(role?: string | Role): string {
  const r = normalizeRole(role as any);
  switch (r) {
    case "PATIENT":   return "/paciente";
    case "CAREGIVER": return "/cuidador";
    case "DOCTOR":    return "/medico";
    default:          return "/login";
  }
}

export function labelForRole(role?: string | Role): string {
  const r = normalizeRole(role as any);
  return r ? roleLabels[r] : "—";
}

/** Permisos por rol (puedes ampliar/ajustar) */
export const ROLE_PERMISSIONS: Record<Role, readonly string[]> = {
  PATIENT: [
    "describe_photos",
    "take_quiz",
    "view_own_reports",
    "view_own_photos",
    "describe_photos",
    "view_own_reports",
    "manage_own_reminders",
  ],
  CAREGIVER: [
    "view_linked_patients",
    "upload_photos_for_patient",
    "describe_photos_for_patient",
    "view_patient_photos",
    "view_patient_reports",
    "manage_patient_reminders",
    "configure_alerts",
    "create_descriptions",
  ],
  DOCTOR: [
    "view_all_patients",
    "view_patient_reports",
    "generate_reports",
    "view_detailed_analytics",
    "configure_alert_policies",
    "export_reports",
    "manage_patient_baselines",
  ],
} as const;

export function hasPermission(userRole: string | Role | undefined, permission: string): boolean {
  const r = normalizeRole(userRole as string);
  if (!r) return false;
  return ROLE_PERMISSIONS[r]?.includes(permission) ?? false;
}

export function canAccessPatient(
  userRole: string | Role | undefined,
  patientId: string,
  userLinkedPatients: string[]
): boolean {
  const r = normalizeRole(userRole as string);
  switch (r) {
    case "DOCTOR": return true;
    case "CAREGIVER":
    case "PATIENT": return userLinkedPatients.includes(patientId);
    default: return false;
  }
}

export const ROLE_ORDER: Role[] = ["DOCTOR", "CAREGIVER", "PATIENT"];
