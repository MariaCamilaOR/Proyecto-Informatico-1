import { useState, useEffect } from "react";
import type { User, AuthState } from "../types/auth";
import { ROLES } from "../lib/roles";

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false
  });

  useEffect(() => {
    // Simular autenticación demo
    const demoUser = localStorage.getItem("demo-user");
    const demoRole = localStorage.getItem("demo-role") as Role || ROLES.PATIENT;
    
    if (demoUser) {
      const user: User = {
        uid: "demo-user-123",
        email: "demo@dyr.com",
        role: demoRole,
        linkedPatientIds: demoRole === ROLES.PATIENT ? ["demo-patient-123"] : ["demo-patient-123"],
        displayName: "Usuario Demo",
        photoURL: undefined,
        isEmailVerified: true,
        createdAt: new Date().toISOString()
      };
      
      setAuthState({
        user,
        loading: false,
        error: null,
        isAuthenticated: true
      });
    } else {
      setAuthState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false
      });
    }
  }, []);

  return authState;
}