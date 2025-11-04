export const roleLabels = {
    PATIENT: "Paciente",
    CAREGIVER: "Cuidador",
    DOCTOR: "Médico",
};
export const ROLES = {
    PATIENT: "PATIENT",
    CAREGIVER: "CAREGIVER",
    DOCTOR: "DOCTOR",
};
/** Acepta valores legacy/minúscula y devuelve el rol canónico */
export function normalizeRole(r) {
    if (!r)
        return undefined;
    const v = r.trim().toUpperCase();
    if (v === "PATIENT" || v === "CAREGIVER" || v === "DOCTOR")
        return v;
    if (r === "patient")
        return "PATIENT";
    if (r === "caregiver")
        return "CAREGIVER";
    if (r === "doctor")
        return "DOCTOR";
    return undefined;
}
export function isRole(r) {
    const v = normalizeRole(String(r));
    return v === "PATIENT" || v === "CAREGIVER" || v === "DOCTOR";
}
/** Ruta de portal por rol */
export function routeByRole(role) {
    const r = normalizeRole(role);
    switch (r) {
        case "PATIENT": return "/paciente";
        case "CAREGIVER": return "/cuidador";
        case "DOCTOR": return "/medico";
        default: return "/login";
    }
}
export function labelForRole(role) {
    const r = normalizeRole(role);
    return r ? roleLabels[r] : "—";
}
/** Permisos por rol (puedes ampliar/ajustar) */
export const ROLE_PERMISSIONS = {
    PATIENT: [
        "view_own_photos",
        "describe_photos",
        "view_own_reports",
        "manage_own_reminders",
    ],
    CAREGIVER: [
        "view_linked_patients",
        "upload_photos_for_patient",
        "view_patient_reports",
        "manage_patient_reminders",
        "configure_alerts",
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
};
export function hasPermission(userRole, permission) {
    const r = normalizeRole(userRole);
    if (!r)
        return false;
    return ROLE_PERMISSIONS[r]?.includes(permission) ?? false;
}
export function canAccessPatient(userRole, patientId, userLinkedPatients) {
    const r = normalizeRole(userRole);
    switch (r) {
        case "DOCTOR": return true;
        case "CAREGIVER":
        case "PATIENT": return userLinkedPatients.includes(patientId);
        default: return false;
    }
}
export const ROLE_ORDER = ["DOCTOR", "CAREGIVER", "PATIENT"];
