import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuth } from "firebase-admin/auth";

type Role = "patient" | "caregiver" | "doctor";
export type AuthedUser = { uid: string; role: Role; linkedPatientIds: string[] };

export function withAuth(
  handler: (req: VercelRequest & { user: AuthedUser }, res: VercelResponse) => Promise<void> | void,
  opts?: { roles?: Role[] }
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      const hdr = req.headers.authorization || "";
      const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
      if (!token) return res.status(401).json({ error: "missing_token" });

      const decoded = await getAuth().verifyIdToken(token, true);
      const role = (decoded.role || decoded["role"]) as Role | undefined;
      const linked = (decoded.linkedPatientIds || decoded["linkedPatientIds"]) as string[] | undefined;
      if (!role || !linked) return res.status(403).json({ error: "claims_missing" });
      if (opts?.roles && !opts.roles.includes(role)) return res.status(403).json({ error: "forbidden" });

      // @ts-ignore - extend req
      req.user = { uid: decoded.uid, role, linkedPatientIds: linked };
      // @ts-ignore
      return handler(req, res);
    } catch (e: any) {
      return res.status(401).json({ error: "invalid_token" });
    }
  };
}
