import { Router } from "express";
import { firestore } from "../firebaseAdmin";
import admin from "../firebaseAdmin";

const router = Router();

const roleOf = (u: any) => String(u?.role || "").toLowerCase();
const isLinked = (u: any, patientId: string) =>
  Array.isArray(u?.linkedPatientIds) && u.linkedPatientIds.includes(patientId);

// POST /api/descriptions/text
router.post("/text", async (req, res) => {
  try {
    const user = (req as any).user;
    const { patientId, photoId, title, description } = req.body || {};
    if (!patientId || !photoId || !description) return res.status(400).json({ error: "missing_fields" });

    const role = roleOf(user);
    if ((role === "doctor" || role === "caregiver") && !isLinked(user, patientId)) {
      return res.status(403).json({ error: "forbidden_patient" });
    }
    if (role === "patient" && user?.uid !== patientId) {
      return res.status(403).json({ error: "forbidden_patient" });
    }

    const docRef = await firestore.collection("descriptions").add({
      patientId,
      photoId,
      type: "text",
      title: title || null,
      description,
      authorUid: user?.uid || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Actualiza la foto con un resumen (opcional)
    try {
      const photoRef = firestore.collection("photos").doc(photoId);
      const photoDoc = await photoRef.get();
      if (photoDoc.exists) await photoRef.set({ description }, { merge: true });
    } catch (err) {
      console.warn("Failed to update photo with description", err);
    }

    const doc = await docRef.get();
    return res.status(201).json({ id: docRef.id, ...doc.data() });
  } catch (e: any) {
    console.error("[descriptions.text] error:", e?.message || e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// POST /api/descriptions/wizard
router.post("/wizard", async (req, res) => {
  try {
    const user = (req as any).user;
    const { patientId, photoId, data } = req.body || {};
    if (!patientId || !photoId || !data) return res.status(400).json({ error: "missing_fields" });

    const role = roleOf(user);
    if ((role === "doctor" || role === "caregiver") && !isLinked(user, patientId)) {
      return res.status(403).json({ error: "forbidden_patient" });
    }
    if (role === "patient" && user?.uid !== patientId) {
      return res.status(403).json({ error: "forbidden_patient" });
    }

    const docRef = await firestore.collection("descriptions").add({
      patientId,
      photoId,
      type: "wizard",
      data,
      authorUid: user?.uid || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Si hay data.details, guarda un resumen en la foto
    try {
      const summary =
        typeof data === "object" && data && (data as any).details
          ? String((data as any).details).slice(0, 512)
          : null;
      if (summary) {
        const photoRef = firestore.collection("photos").doc(photoId);
        const photoDoc = await photoRef.get();
        if (photoDoc.exists) await photoRef.set({ description: summary }, { merge: true });
      }
    } catch (err) {
      console.warn("Failed to update photo with wizard summary", err);
    }

    const doc = await docRef.get();
    return res.status(201).json({ id: docRef.id, ...doc.data() });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// GET /api/descriptions/patient/:id
router.get("/patient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const role = roleOf(user);

    if ((role === "doctor" || role === "caregiver") && !isLinked(user, id)) {
      return res.status(403).json({ error: "forbidden_patient" });
    }
    if (role === "patient" && user?.uid !== id) {
      return res.status(403).json({ error: "forbidden_patient" });
    }

    const snap = await firestore.collection("descriptions").where("patientId", "==", id).get();
    const items: any[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));

    const toMillis = (v: any) => {
      if (!v) return 0;
      if (v.toDate && typeof v.toDate === "function") return v.toDate().getTime();
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
      const dt = new Date(v);
      return isNaN(dt.getTime()) ? 0 : dt.getTime();
    };
    items.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

    return res.json(items);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

export default router;
