import { Router } from "express";
import admin, { firestore } from "../firebaseAdmin";
import { verifyTokenNoClaims, verifyTokenMiddleware } from "../middleware/expressAuth";

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

  // Generate an invitation code for the patient if role is patient
  const inviteCode = role === "patient" ? Math.random().toString(36).slice(2, 10).toUpperCase() : undefined;

  // Set custom claims on the user
  const claims: any = { role, linkedPatientIds: [patientId] };
  await admin.auth().setCustomUserClaims(uid, claims);

  // Update Firestore user doc with linkedPatientIds, role and inviteCode (if patient)
  const updateObj: any = { role, linkedPatientIds: [patientId] };
  if (inviteCode) updateObj.inviteCode = inviteCode;
  await firestore.collection("users").doc(uid).set(updateObj, { merge: true });

    return res.json({ ok: true, uid, patientId });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("complete-registration failed:", err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

// GET /api/users/:id - get basic user info (protected)
router.get("/:id", verifyTokenMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await firestore.collection("users").doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: "user_not_found" });
    const data = doc.data() as any;
    return res.json({ id: doc.id, displayName: data.displayName || null, email: data.email || null, role: data.role || null, raw: data });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("Error getting user", e);
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

export default router;
