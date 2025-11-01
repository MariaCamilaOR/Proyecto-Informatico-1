import { useState, useEffect } from "react";
import type { User, AuthState, Role } from "../types/auth";
import { ROLES } from "../lib/roles";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false
  });

  useEffect(() => {
    let unsub = () => {};

    // Prefer real Firebase auth if available
    try {
      unsub = onAuthStateChanged(auth, async (u) => {
        if (u) {
          // get custom claims from the ID token
          const idTokenResult = await getIdTokenResult(u, true);
          const claims: any = idTokenResult.claims || {};
          const role = (claims.role as Role) || (localStorage.getItem("demo-role") as Role) || ROLES.PATIENT;
          const linked = (claims.linkedPatientIds as string[]) || [localStorage.getItem("demo-patient-123") || "demo-patient-123"];

          const userObj: User = {
            uid: u.uid,
            email: u.email || "",
            role,
            linkedPatientIds: linked,
            displayName: u.displayName || undefined,
            photoURL: u.photoURL || undefined,
            isEmailVerified: u.emailVerified,
            createdAt: new Date().toISOString()
          };

          setAuthState({ user: userObj, loading: false, error: null, isAuthenticated: true });
        } else {
          // fallback to demo localStorage mode
          const demoUser = localStorage.getItem("demo-user");
          const demoRole = (localStorage.getItem("demo-role") as Role) || ROLES.PATIENT;

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
            setAuthState({ user, loading: false, error: null, isAuthenticated: true });
          } else {
            setAuthState({ user: null, loading: false, error: null, isAuthenticated: false });
          }
        }
      });
    } catch (e) {
      // If anything goes wrong, fallback to demo mode as before
      const demoUser = localStorage.getItem("demo-user");
      const demoRole = (localStorage.getItem("demo-role") as Role) || ROLES.PATIENT;
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
        setAuthState({ user, loading: false, error: null, isAuthenticated: true });
      } else {
        setAuthState({ user: null, loading: false, error: null, isAuthenticated: false });
      }
    }

    return () => unsub();
  }, []);

  return authState;
}