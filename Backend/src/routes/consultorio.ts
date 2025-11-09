import { Router } from "express";
import { firestore } from "../firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const router = Router();

const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();

// POST /api/consultorio/session/start
// body: { patientId: string, n?: number, types?: ("who"|"where"|"free")[] }
router.post("/session/start", async (req, res) => {
  try {
    const { patientId, n = 6, types = ["who", "where", "free"] } = req.body || {};
    if (!patientId) return res.status(400).json({ error: "missing_patientId" });

    // fotos recientes del paciente
    const photosSnap = await firestore
      .collection("photos")
      .where("patientId", "==", patientId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const photos = photosSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    if (!photos.length) return res.status(400).json({ error: "no_photos" });

    // seleccionar N al azar
    const pick = [...photos].sort(() => Math.random() - 0.5).slice(0, Math.max(1, Math.min(n, photos.length)));

    const sessionRef = await firestore.collection("consult_sessions").add({
      patientId,
      startedAt: new Date(),
      endedAt: null,
      total: pick.length,
      correct: 0,
      scorePct: 0
    });

    const buildExpected = (p: any) => {
      const tags = Array.isArray(p.tags) ? p.tags : [];
      const desc = String(p.description || "");
      const people = tags.filter((t: string) => t.startsWith("persona:")).map((t: string) => t.split(":")[1]);
      const places = tags.filter((t: string) => t.startsWith("lugar:")).map((t: string) => t.split(":")[1]);
      const free = [...tags, ...desc.split(/\s+/)];
      return {
        who: people.map(norm).filter(Boolean),
        where: places.map(norm).filter(Boolean),
        free: free.map(norm).filter(Boolean)
      };
    };

    const batch = firestore.batch();
    const questionsToSend: any[] = [];

    pick.forEach((p, i) => {
      const expected = buildExpected(p);
      const type = types[i % types.length] as "who" | "where" | "free";
      const prompt =
        type === "who" ? "¿Quién aparece en esta foto?" :
        type === "where" ? "¿Dónde fue tomada esta foto?" :
        "Describe brevemente lo que ves en la foto.";

      const qRef = sessionRef.collection("questions").doc();
      batch.set(qRef, {  
        photoId: p.id,
        type,
        prompt,
        expected: expected[type] ?? [],
        order: i
      });

      // no enviamos expected al front
      questionsToSend.push({
        id: qRef.id,
        photoId: p.id,
        type,
        prompt,
        order: i,
        photoUrl: p.url ?? null
      });
    });

    await batch.commit();
    return res.status(201).json({ sessionId: sessionRef.id, questions: questionsToSend });
  } catch (e: any) {
    console.error("[consultorio.start]", e);
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

// POST /api/consultorio/session/:sessionId/answer
// body: { questionId: string, answer: string }
router.post("/session/:sessionId/answer", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, answer } = req.body || {};
    if (!questionId || typeof answer !== "string")
      return res.status(400).json({ error: "missing_fields" });

    const qRef = firestore.doc(`consult_sessions/${sessionId}/questions/${questionId}`);
    const qDoc = await qRef.get();
    if (!qDoc.exists) return res.status(404).json({ error: "question_not_found" });

    const q = qDoc.data() as any;
    const expected: string[] = Array.isArray(q.expected) ? q.expected : [];
    const ok = expected.length ? expected.some(e => norm(answer) === norm(e)) : norm(answer).length >= 3;

    const aRef = firestore.collection(`consult_sessions/${sessionId}/answers`).doc();
    await aRef.set({
      questionId,
      answer,
      isCorrect: ok,
      answeredAt: new Date()
    });

    if (ok) {
      await firestore.doc(`consult_sessions/${sessionId}`).update({ correct: FieldValue.increment(1) });
    }

    const sess = (await firestore.doc(`consult_sessions/${sessionId}`).get()).data() as any;
    const ansCount = (await firestore.collection(`consult_sessions/${sessionId}/answers`).get()).size;
    const progressPct = Math.round((ansCount / (sess.total || 1)) * 100);

    return res.json({ isCorrect: ok, progressPct });
  } catch (e: any) {
    console.error("[consultorio.answer]", e);
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

// POST /api/consultorio/session/:sessionId/finish
router.post("/session/:sessionId/finish", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sRef = firestore.doc(`consult_sessions/${sessionId}`);
    const sDoc = await sRef.get();
    if (!sDoc.exists) return res.status(404).json({ error: "session_not_found" });
    const s = sDoc.data() as any;

    const scorePct = Math.round(((s.correct || 0) / (s.total || 1)) * 100);
    await sRef.update({ endedAt: new Date(), scorePct });

    // tendencia vs sesión previa
    const prevSnap = await firestore.collection("consult_sessions")
      .where("patientId", "==", s.patientId)
      .where("endedAt", "!=", null)
      .orderBy("endedAt", "desc")
      .limit(2)
      .get();

    let trendDelta = 0;
    if (prevSnap.size >= 2) {
      const prev = prevSnap.docs[1].data() as any;
      trendDelta = Math.round(scorePct - (prev.scorePct ?? 0));
    }
    await sRef.update({ trendDelta });

    return res.json({ sessionId, scorePct, trendDelta });
  } catch (e: any) {
    console.error("[consultorio.finish]", e);
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

// GET /api/consultorio/sessions?patientId=xxx&limit=10
router.get("/sessions", async (req, res) => {
  try {
    const patientId = String(req.query.patientId || "");
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "10"), 10)));
    if (!patientId) return res.status(400).json({ error: "missing_patientId" });

    const snap = await firestore.collection("consult_sessions")
      .where("patientId", "==", patientId)
      .where("endedAt", "!=", null)
      .orderBy("endedAt", "desc")
      .limit(limit)
      .get();

    const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    return res.json(data.reverse());
  } catch (e: any) {
    console.error("[consultorio.sessions]", e);
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

export default router;
