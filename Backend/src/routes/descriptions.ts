import { Router } from "express";
import { firestore } from "../firebaseAdmin";
import admin from "../firebaseAdmin";

const router = Router();

const roleOf = (u: any) => String(u?.role || "").toLowerCase();
const isLinked = (u: any, patientId: string) =>
  Array.isArray(u?.linkedPatientIds) && u.linkedPatientIds.includes(patientId);

// Normaliza booleans Y/N por campos básicos
function buildCaregiverYN(data: any) {
  const yn = {
    hasEvents: !!data?.events,
    hasPeople: Array.isArray(data?.people) ? data.people.length > 0 : !!data?.people,
    hasPlaces: !!data?.places,
    hasEmotions: !!data?.emotions,
    hasDetails: !!data?.details,
  };
  return [
    { itemId: "hasEvents", yn: yn.hasEvents },
    { itemId: "hasPeople", yn: yn.hasPeople },
    { itemId: "hasPlaces", yn: yn.hasPlaces },
    { itemId: "hasEmotions", yn: yn.hasEmotions },
    { itemId: "hasDetails", yn: yn.hasDetails },
  ];
}

// POST /api/descriptions/text
router.post("/text", async (req, res) => {
  try {
    const user = (req as any).user;
    const { patientId, photoId, title, description, data } = req.body || {};
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
      data: data || null, // opcional: { events, people[], places, emotions, details }
      authorUid: user?.uid || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Actualiza la foto con resumen y caregiverAnswers (si hay data)
    try {
      const photoRef = firestore.collection("photos").doc(photoId);
      const caregiverAnswers = buildCaregiverYN(data || {});
      await photoRef.set(
        {
          description: String(description).slice(0, 512),
          caregiverAnswers, // [{ itemId, yn }]
          caregiverAnswersUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Failed to update photo with description/caregiverAnswers", err);
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

    // Guardar resumen + caregiverAnswers en la photo
    try {
      const summary = typeof data?.details === "string" ? data.details.slice(0, 512) : null;
      const caregiverAnswers = buildCaregiverYN(data);
      const photoRef = firestore.collection("photos").doc(photoId);
      await photoRef.set(
        {
          description: summary,
          caregiverAnswers,
          caregiverAnswersUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Failed to update photo with wizard summary/caregiverAnswers", err);
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
