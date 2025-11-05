import { Router } from "express";
import { firestore } from "../firebaseAdmin";
import admin from "../firebaseAdmin";

const router = Router();

type Role = "patient" | "caregiver" | "doctor";
type AuthedUser = { uid: string; role?: Role; linkedPatientIds?: string[] };

const getUser = (req: any): AuthedUser | undefined => (req as any)?.user;
const isLinked = (u: AuthedUser | undefined, pid: string) =>
  Array.isArray(u?.linkedPatientIds) && u!.linkedPatientIds!.includes(pid);

// POST /api/notifications
// body: { patientId, type, message?, payload? }
router.post("/", async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return res.status(401).json({ error: "missing_auth" });
    const role = String(u.role || "").toLowerCase();

    const { patientId, type, message, payload } = req.body || {};
    if (!patientId || !type) return res.status(400).json({ error: "missing_fields" });

    // Solo doctor/caregiver pueden notificar a un paciente vinculado.
    if ((role === "doctor" || role === "caregiver")) {
      if (!isLinked(u, String(patientId))) {
        return res.status(403).json({ error: "forbidden_patient" });
      }
    } else if (role !== "patient") {
      return res.status(403).json({ error: "forbidden_role" });
    }

    const ref = await firestore.collection("notifications").add({
      targetUid: patientId,
      type,                 // ej: "baseline_request" | "quiz_request"
      message: message || null,
      payload: payload || null, // ej: { quizId }
      createdBy: u.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });

    const doc = await ref.get();
    return res.status(201).json({ id: ref.id, ...doc.data() });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

// GET /api/notifications  -> del usuario autenticado
router.get("/", async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return res.status(401).json({ error: "missing_auth" });

    const snap = await firestore
      .collection("notifications")
      .where("targetUid", "==", u.uid)
      .orderBy("createdAt", "desc")
      .get();

    const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    return res.json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", async (req, res) => {
  try {
    const u = getUser(req);
    if (!u) return res.status(401).json({ error: "missing_auth" });

    const id = String(req.params.id);
    const ref = firestore.collection("notifications").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: "not_found" });

    const data = doc.data() as any;
    if (data.targetUid !== u.uid) return res.status(403).json({ error: "forbidden" });

    await ref.set({ read: true, readAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return res.json({ id, ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

export default router;
