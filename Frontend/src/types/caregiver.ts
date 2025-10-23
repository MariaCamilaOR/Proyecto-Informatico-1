export interface CaregiverLink {
  id: string;
  caregiverId: string;
  patientId: string;
  relationship: string;
  status: "pending" | "active" | "rejected" | "revoked";
  createdAt: string;
  updatedAt: string;
  permissions: CaregiverPermission[];
}

export interface CaregiverPermission {
  id: string;
  type: "view_photos" | "upload_photos" | "view_reports" | "manage_reminders" | "view_sessions";
  granted: boolean;
  grantedAt?: string;
}

export interface CaregiverInvitation {
  id: string;
  patientId: string;
  caregiverEmail: string;
  relationship: string;
  message?: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  expiresAt: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  age?: number;
  diagnosis?: string;
  linkedCaregivers: CaregiverLink[];
}
