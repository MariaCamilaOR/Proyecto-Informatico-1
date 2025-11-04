import { Request, Response, NextFunction } from "express";
import { auth } from "../firebaseAdmin";

export type Role = "patient" | "caregiver" | "doctor";

export interface AuthedUser {
  uid: string;
  role: Role;
  linkedPatientIds: string[];
}

export async function verifyTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  // In local dev you can skip auth by setting SKIP_AUTH=true and providing demo values.
  if (process.env.SKIP_AUTH === "true") {
    const demoUid = process.env.DEMO_UID || "demo-user-123";
    const demoRole = (process.env.DEMO_ROLE as Role) || "patient";
    const demoPatient = process.env.DEMO_PATIENT_ID || "demo-patient-123";
    (req as any).user = { uid: demoUid, role: demoRole, linkedPatientIds: [demoPatient] } as AuthedUser;
    return next();
  }

  try {
    const hdr = (req.headers.authorization || "") as string;
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
    if (!token) return res.status(401).json({ error: "missing_token" });

    const decoded = await auth.verifyIdToken(token, true);
    // log the uid being verified for debugging
    // eslint-disable-next-line no-console
    console.log(`Verified token for uid=${decoded.uid}`);

    const role = (decoded.role || decoded["role"]) as Role | undefined;
    const linked = (decoded.linkedPatientIds || decoded["linkedPatientIds"]) as string[] | undefined;
    if (!role || !linked) return res.status(403).json({ error: "claims_missing" });

    (req as any).user = { uid: decoded.uid, role, linkedPatientIds: linked } as AuthedUser;
    return next();
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Token verification error:', err);
    const msg = err?.message || String(err);
    // In dev provide error message for easier debugging. In production avoid leaking details.
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'invalid_token' });
    }
    return res.status(401).json({ error: 'invalid_token', message: msg });
  }
}
 
// Verify ID token but do NOT require custom claims (used for registration completion)
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
    // attach minimal user info
    (req as any).user = { uid: decoded.uid } as AuthedUser;
    return next();
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Token verification (no-claims) error:', err?.message || err);
    return res.status(401).json({ error: 'invalid_token', message: err?.message || String(err) });
  }
}
