// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { onAuthStateChanged, getIdTokenResult, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { normalizeRole, ROLES } from "../lib/roles";
const DEMO = import.meta.env.VITE_DEMO === "true";
export function useAuth() {
    const [state, setState] = useState({
        user: null,
        loading: true,
        error: null,
        isAuthenticated: false,
    });
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            try {
                if (!u) {
                    // SIN demo: no role “pegado”
                    if (!DEMO) {
                        setState({ user: null, loading: false, error: null, isAuthenticated: false });
                        return;
                    }
                    // DEMO opcional
                    const demo = localStorage.getItem("demo-user");
                    const demoRole = normalizeRole(localStorage.getItem("demo-role") || "") || ROLES.PATIENT;
                    if (demo) {
                        setState({
                            user: {
                                uid: "demo-user-123",
                                email: "demo@dyr.com",
                                role: demoRole,
                                linkedPatientIds: ["demo-patient-123"],
                                displayName: "Usuario Demo",
                                isEmailVerified: true,
                                createdAt: new Date().toISOString(),
                            },
                            loading: false,
                            error: null,
                            isAuthenticated: true,
                        });
                    }
                    else {
                        setState({ user: null, loading: false, error: null, isAuthenticated: false });
                    }
                    return;
                }
                // claims (si luego usas custom claims)
                const token = await getIdTokenResult(u, true);
                const claims = token?.claims ?? {};
                const roleFromClaims = normalizeRole(String(claims.role));
                // perfil en Firestore
                const ref = doc(db, "users", u.uid);
                const snap = await getDoc(ref);
                const roleFromDb = snap.exists() ? normalizeRole(String(snap.data()?.role)) : undefined;
                const role = roleFromDb || roleFromClaims;
                // linked patients
                const linked = (snap.exists() && Array.isArray(snap.data()?.linkedPatientIds) && snap.data()?.linkedPatientIds) ||
                    (role === ROLES.PATIENT ? [u.uid] : ["demo-patient-123"]);
                const inviteCode = snap.exists() ? (snap.data()?.inviteCode ?? null) : null;
                const userObj = {
                    uid: u.uid,
                    email: u.email ?? "",
                    role,
                    inviteCode,
                    linkedPatientIds: linked,
                    displayName: u.displayName ?? undefined,
                    photoURL: u.photoURL ?? undefined,
                    isEmailVerified: u.emailVerified,
                    createdAt: new Date().toISOString(),
                };
                // Si no hay rol en DB/claims -> cerramos sesión (no queda rol colgado)
                if (!userObj.role) {
                    await signOut(auth);
                    setState({ user: null, loading: false, error: null, isAuthenticated: false });
                    return;
                }
                setState({ user: userObj, loading: false, error: null, isAuthenticated: true });
            }
            catch (e) {
                setState({ user: null, loading: false, error: e?.message ?? "Auth error", isAuthenticated: false });
            }
        });
        return () => unsub();
    }, []);
    return state;
}
