export type Role = "patient" | "caregiver" | "doctor";
export type User = {
  uid: string;
  email: string;
  role: Role;
  linkedPatientIds: string[];
  displayName?: string;
  photoURL?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
};