import { Router } from "express";
import admin, { firestore } from "../firebaseAdmin";
import { verifyTokenNoClaims } from "../middleware/expressAuth";

const router = Router();

// POST /api/users/complete-registration
// Body: { patientId?: string, role?: string }
// This endpoint is callable by a newly-registered user (they must send their ID token in Authorization header).
router.post("/complete-registration", verifyTokenNoClaims, async (req, res) => {
  try {
    const uid = (req as any).user?.uid;
    if (!uid) return res.status(401).json({ error: "missing_uid" });

    const body = req.body || {};
    // If client provides a patientId, use it; otherwise default to uid
    const patientId = body.patientId || uid;
    const role = body.role || "patient";

    // Set custom claims on the user
    await admin.auth().setCustomUserClaims(uid, { role, linkedPatientIds: [patientId] });

    // Update Firestore user doc with linkedPatientIds and role (merge)
    await firestore.collection("users").doc(uid).set({ role, linkedPatientIds: [patientId] }, { merge: true });

    return res.json({ ok: true, uid, patientId });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("complete-registration failed:", err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

export default router;
