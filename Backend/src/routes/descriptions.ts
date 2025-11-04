import { Router } from "express";
import { firestore } from "../firebaseAdmin";

const router = Router();

// POST /api/descriptions/text
router.post("/text", async (req, res) => {
  try {
    const user = (req as any).user;
    const { patientId, photoId, title, description } = req.body || {};
    if (!patientId || !photoId || !description) return res.status(400).json({ error: "missing_fields" });

    // Basic access check: if user has linkedPatientIds, ensure patientId belongs to them
    if (user && user.linkedPatientIds && !user.linkedPatientIds.includes(patientId)) {
      return res.status(403).json({ error: "forbidden_patient" });
    }

    const docRef = await firestore.collection("descriptions").add({
      patientId,
      photoId,
      type: "text",
      title: title || null,
      description,
      authorUid: user?.uid || null,
      createdAt: new Date()
    });

    // Also update the photo metadata (set description field) if exists
    try {
      const photoRef = firestore.collection("photos").doc(photoId);
      const photoDoc = await photoRef.get();
      if (photoDoc.exists) {
        await photoRef.set({ description }, { merge: true });
      }
    } catch (err) {
      // non-fatal
      // eslint-disable-next-line no-console
      console.warn("Failed to update photo with description", err);
    }

    const doc = await docRef.get();
    return res.status(201).json({ id: docRef.id, ...doc.data() });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// POST /api/descriptions/wizard - accepts arbitrary wizard data
router.post("/wizard", async (req, res) => {
  try {
    const user = (req as any).user;
    const { patientId, photoId, data } = req.body || {};
    if (!patientId || !photoId || !data) return res.status(400).json({ error: "missing_fields" });

    if (user && user.linkedPatientIds && !user.linkedPatientIds.includes(patientId)) {
      return res.status(403).json({ error: "forbidden_patient" });
    }

    const docRef = await firestore.collection("descriptions").add({
      patientId,
      photoId,
      type: "wizard",
      data,
      authorUid: user?.uid || null,
      createdAt: new Date()
    });

    // Optionally set a short summary onto photo.description (if data contains a 'details' or similar)
    try {
      const summary = typeof data === 'object' && data.details ? String(data.details).slice(0, 512) : null;
      if (summary) {
        const photoRef = firestore.collection("photos").doc(photoId);
        const photoDoc = await photoRef.get();
        if (photoDoc.exists) {
          await photoRef.set({ description: summary }, { merge: true });
        }
      }
    } catch (err) {
      // non-fatal
      // eslint-disable-next-line no-console
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
    const snap = await firestore.collection("descriptions").where("patientId", "==", id).orderBy("createdAt", "desc").get();
    const items: any[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    return res.json(items);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

export default router;
