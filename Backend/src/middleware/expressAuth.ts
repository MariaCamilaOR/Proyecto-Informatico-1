import { Request, Response, NextFunction } from "express";
import { auth, firestore } from "../firebaseAdmin";

export type Role = "patient" | "caregiver" | "doctor";

export interface AuthedUser {
  uid: string;
  role: Role;
  linkedPatientIds: string[];
}

export async function verifyTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  // Dev rápido
  if (process.env.SKIP_AUTH === "true") {
    const demoUid = process.env.DEMO_UID || "demo-user-123";
    const demoRole = (process.env.DEMO_ROLE as Role) || "caregiver";
    const demoPatient = process.env.DEMO_PATIENT_ID || "demo-patient-123";
    console.log("Using demo auth:", { demoUid, demoRole, demoPatient });
    (req as any).user = { 
      uid: demoUid, 
      role: demoRole, 
      linkedPatientIds: [demoPatient],
      // Permisos adicionales para desarrollo
      permissions: ["upload_photos_for_patient", "describe_photos_for_patient", "view_patient_photos"]
    } as AuthedUser;
    return next();
  }

  try {
    const hdr = (req.headers.authorization || "") as string;
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
    if (!token) return res.status(401).json({ error: "missing_token" });

    const decoded = await auth.verifyIdToken(token, true);
    // eslint-disable-next-line no-console
    console.log(`Verified token for uid=${decoded.uid}`);

    let role = (decoded as any).role as Role | undefined;
    let linked = (decoded as any).linkedPatientIds as string[] | undefined;

    // Fallback: leer de Firestore si el token no trae claims
    if (!role || !linked) {
      try {
        const doc = await firestore.collection("users").doc(String(decoded.uid)).get();
        if (doc.exists) {
          const data = doc.data() as any;
          role = role || (String(data.role || "") as Role);
          if (Array.isArray(data.linkedPatientIds)) linked = data.linkedPatientIds;
        }
      } catch (err) {
        console.warn("Failed to read user profile for claims fallback", err);
      }
    }

    if (!role) return res.status(403).json({ error: "claims_missing_role" });
    if (!linked) linked = [];

    (req as any).user = { uid: decoded.uid, role, linkedPatientIds: linked } as AuthedUser;
    return next();
  } catch (err: any) {
    console.error("Token verification error:", err);
    if (process.env.NODE_ENV === "production") {
      return res.status(401).json({ error: "invalid_token" });
    }
    return res.status(401).json({ error: "invalid_token", message: err?.message || String(err) });
  }
}

// Para endpoints que solo requieren un token válido (sin claims)
export async function verifyTokenNoClaims(req: Request, res: Response, next: NextFunction) {
  if (process.env.SKIP_AUTH === "true") {
    const demoUid = process.env.DEMO_UID || "demo-user-123";
    (req as any).user = { uid: demoUid } as AuthedUser;
    return next();
  }

  try {
    const hdr = (req.headers.authorization || "") as string;
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
    if (!token) return res.status(401).json({ error: "missing_token" });

    const decoded = await auth.verifyIdToken(token, true);
    (req as any).user = { uid: decoded.uid } as AuthedUser;
    return next();
  } catch (err: any) {
    console.error("Token verification (no-claims) error:", err?.message || err);
    return res.status(401).json({ error: "invalid_token", message: err?.message || String(err) });
  }
}
