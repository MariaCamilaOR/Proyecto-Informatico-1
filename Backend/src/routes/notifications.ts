import { Router } from "express";
import { firestore } from "../firebaseAdmin";

const router = Router();

// POST /api/notifications - create a simple notification for a patient
// body: { patientId, type, message }
router.post("/", async (req, res) => {
  try {
    const authUser = (req as any).user;
    if (!authUser) return res.status(401).json({ error: "missing_auth" });

    const { patientId, type, message } = req.body || {};
    if (!patientId || !type) return res.status(400).json({ error: "missing_fields" });

    const docRef = await firestore.collection("notifications").add({
      patientId,
      type,
      message: message || null,
      fromUid: authUser.uid,
      fromRole: authUser.role || null,
      read: false,
      createdAt: new Date(),
    });

    const doc = await docRef.get();
    return res.status(201).json({ id: docRef.id, ...doc.data() });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

export default router;
