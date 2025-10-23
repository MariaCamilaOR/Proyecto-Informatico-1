import type { Role } from "../types/auth";

export const ROLES = {
  PATIENT: "patient" as Role,
  CAREGIVER: "caregiver" as Role,
  DOCTOR: "doctor" as Role,
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.PATIENT]: [
    "view_own_photos",
    "upload_photos", 
    "describe_photos",
    "view_own_reports",
    "manage_own_reminders"
  ],
  [ROLES.CAREGIVER]: [
    "view_linked_patients",
    "upload_photos_for_patient",
    "view_patient_reports",
    "manage_patient_reminders",
    "configure_alerts"
  ],
  [ROLES.DOCTOR]: [
    "view_all_patients",
    "view_patient_reports",
    "generate_reports",
    "view_detailed_analytics",
    "configure_alert_policies",
    "export_reports",
    "manage_patient_baselines"
  ]
} as const;

export function hasPermission(userRole: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

export function canAccessPatient(userRole: Role, patientId: string, userLinkedPatients: string[]): boolean {
  switch (userRole) {
    case ROLES.DOCTOR:
      return true;
    case ROLES.CAREGIVER:
      return userLinkedPatients.includes(patientId);
    case ROLES.PATIENT:
      return userLinkedPatients.includes(patientId);
    default:
      return false;
  }
}
