import { Router } from "express";
import { firestore } from "../firebaseAdmin";
import admin from "../firebaseAdmin";

const router = Router();

const toMillis = (v: any) => {
  if (!v) return 0;
  if (v?.toDate && typeof v.toDate === "function") return v.toDate().getTime();
  const n = Number(v);
  if (!Number.isNaN(n)) return n;
  const dt = new Date(v);
  return isNaN(dt.getTime()) ? 0 : dt.getTime();
};

// GET /api/reports/patient/:id?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/patient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;

    const snap = await firestore.collection("reports").where("patientId", "==", id).get();
    const items: any[] = [];
    snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));

    let filtered = items;
    if (from) {
      const fromTs = new Date(from).getTime();
      filtered = filtered.filter((it) => toMillis(it.createdAt) >= fromTs);
    }
    if (to) {
      const toTs = new Date(to).getTime();
      filtered = filtered.filter((it) => toMillis(it.createdAt) <= toTs);
    }

    filtered.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
    return res.json(filtered);
  } catch (e: any) {
    console.error("[reports] list error:", e?.message || String(e));
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// POST /api/reports
router.post("/", async (req, res) => {
  try {
    const authUser = (req as any).user;
    if (!authUser) return res.status(401).json({ error: "missing_auth" });
    const role = String(authUser.role || "").toLowerCase();
    if (role !== "doctor" && role !== "caregiver") return res.status(403).json({ error: "forbidden_role" });

    const { patientId, data, baseline } = req.body || {};
    if (!patientId || !data) return res.status(400).json({ error: "missing_fields" });

    const docRef = await firestore.collection("reports").add({
      patientId,
      data,
      baseline: baseline || null,
      createdBy: authUser.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      quizResults: [],
    });

    const doc = await docRef.get();
    return res.status(201).json({ id: docRef.id, ...doc.data() });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// PATCH /api/reports/:id/attach-quiz
router.patch("/:id/attach-quiz", async (req, res) => {
  try {
    const id = String(req.params.id);
    const { quizId, score, classification, submittedAt } = req.body || {};
    if (!quizId || typeof score !== "number") {
      return res.status(400).json({ error: "missing_fields" });
    }
    const ref = firestore.collection("reports").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: "report_not_found" });

    await ref.set(
      {
        quizResults: admin.firestore.FieldValue.arrayUnion({
          quizId,
          score,
          classification,
          submittedAt: submittedAt || admin.firestore.FieldValue.serverTimestamp(),
        }),
      },
      { merge: true }
    );

    const updated = await ref.get();
    return res.json({ id: ref.id, ...updated.data() });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

// GET /api/reports/summary/:patientId?days=30
router.get("/summary/:patientId", async (req, res) => {
  try {
    const patientId = String(req.params.patientId);
    const days = Number(req.query.days || 30);
    const since = Date.now() - days * 24 * 60 * 60 * 1000;

    const qSnap = await firestore.collection("quizzes").where("patientId", "==", patientId).get();
    const quizzes = qSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })).filter((q) => q.status === "completed");

    const recent = quizzes.filter((q) => toMillis(q.submittedAt) >= since);
    const takePct = (arr: any[]) =>
      arr.length ? Math.round((arr.reduce((s, q) => s + Number(q.score || 0), 0) / arr.length) * 100) : 0;

    const currentScorePct = takePct(recent.length ? recent : quizzes);

    const sortedAll = [...quizzes].sort((a, b) => toMillis(a.submittedAt) - toMillis(b.submittedAt));
    const baselineSample = sortedAll.slice(0, 3);
    const baselinePct = baselineSample.length ? takePct(baselineSample) : 75;
    const diffPct = currentScorePct - baselinePct;

    const dSnap = await firestore.collection("descriptions").where("patientId", "==", patientId).get();
    const photosDescribedTotal = dSnap.size;

    const recallPct = currentScorePct;
    const coherencePct = Math.min(100, Math.round(currentScorePct * 0.95) + 5);

    const recommendations = [
      currentScorePct >= baselinePct ? "Mantener sesiones regulares" : "Incrementar sesiones y reforzar recuerdos positivos",
      photosDescribedTotal < 10 ? "Describir más fotos ayuda a personalizar los quizzes" : "🎯 Buen volumen de material descrito",
    ];

    return res.json({
      windowDays: days,
      sessionsCompleted: recent.length,
      photosDescribedTotal,
      currentScorePct,
      baselinePct,
      diffPct,
      recallPct,
      coherencePct,
      recommendations,
    });
  } catch (e: any) {
    console.error("[reports.summary]", e);
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

export default router;
