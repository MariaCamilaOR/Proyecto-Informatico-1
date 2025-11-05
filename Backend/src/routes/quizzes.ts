import { Router } from "express";
import { firestore } from "../firebaseAdmin";
import admin from "../firebaseAdmin";

const router = Router();

/** ==== helpers de auth (tipado seguro) ==== */
type Role = "patient" | "caregiver" | "doctor";
type AuthedUser = { uid: string; role?: Role; linkedPatientIds?: string[] };

const getAuthUser = (req: any): AuthedUser | undefined => (req as any)?.user as AuthedUser | undefined;
const roleOf = (u: AuthedUser | undefined): Role | undefined =>
  (u?.role ? String(u.role).toLowerCase() as Role : undefined);
const isLinked = (u: AuthedUser | undefined, patientId: string) =>
  Array.isArray(u?.linkedPatientIds) && u!.linkedPatientIds!.includes(patientId);

const allowPatientContext = (req: any, patientId: string) => {
  const user = getAuthUser(req);
  const role = roleOf(user);
  if (!role) return false;
  if (role === "patient") return user?.uid === patientId;
  if (role === "doctor" || role === "caregiver") return isLinked(user, patientId);
  return false;
};
/** ========================================= */

/** ==== utilidades de quiz ==== */
const normList = (val: any): string[] => {
  if (val == null) return [];
  if (Array.isArray(val)) return val.map(v => String(v).trim()).filter(Boolean);
  if (typeof val === "object") return Object.values(val).flatMap(normList).filter(Boolean);
  let s = String(val).trim(); if (!s) return [];
  try { return normList(JSON.parse(s)); } catch { /* ignore */ }
  s = s.replace(/[{}\[\]"]/g, "");
  return s.split(/[,;\n]/).map(x => x.trim()).filter(Boolean);
};
const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));
const shuffle = <T,>(a: T[]) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};
const pickN = <T,>(arr: T[], n: number) => shuffle(arr).slice(0, n);
const mkId = () => Math.random().toString(36).slice(2, 10);

type QuizItem = {
  id: string;
  type: "mc" | "yn";
  prompt: string;
  options?: string[];
  correctIndex?: number;
  weight: number;
  descriptionId?: string;
  field?: string;
};

const buildMc = (
  prompt: string,
  correct: string,
  pool: string[],
  descriptionId: string,
  field: string
): QuizItem | null => {
  const distractors = pickN(pool.filter(v => v !== correct), 3);
  const options = uniq([correct, ...distractors]);
  if (options.length < 2) return null;
  const shuffled = shuffle(options);
  const correctIndex = shuffled.findIndex(o => o === correct);
  return { id: mkId(), type: "mc", prompt, options: shuffled, correctIndex, weight: 1, descriptionId, field };
};

const classify = (score01: number): "Excelente" | "Bueno" | "Atención" | "Riesgo" => {
  const p = Math.round(score01 * 100);
  if (p >= 85) return "Excelente";
  if (p >= 70) return "Bueno";
  if (p >= 50) return "Atención";
  return "Riesgo";
};

const toMillis = (v: any) => {
  if (!v) return 0;
  if (v?.toDate && typeof v.toDate === "function") return v.toDate().getTime();
  const n = Number(v);
  if (!Number.isNaN(n)) return n;
  const dt = new Date(v);
  return isNaN(dt.getTime()) ? 0 : dt.getTime();
};

async function attachQuizResultToReport(options: {
  patientId: string;
  result: { quizId: string; score: number; classification: string; submittedAt: any };
  reportId?: string;
}) {
  const { patientId, result, reportId } = options;

  if (reportId) {
    const rref = firestore.collection("reports").doc(reportId);
    const rdoc = await rref.get();
    if (rdoc.exists && (rdoc.data() as any)?.patientId === patientId) {
      await rref.set(
        { quizResults: admin.firestore.FieldValue.arrayUnion(result) },
        { merge: true }
      );
      return;
    }
  }

  const rsnap = await firestore.collection("reports").where("patientId", "==", patientId).get();
  const arr = rsnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  arr.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

  if (arr.length > 0) {
    const lastRef = firestore.collection("reports").doc(arr[0].id);
    await lastRef.set(
      { quizResults: admin.firestore.FieldValue.arrayUnion(result) },
      { merge: true }
    );
    return;
  }

  await firestore.collection("reports").add({
    patientId,
    data: { descriptions: [], createdBy: null },
    baseline: null,
    createdBy: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    quizResults: [result],
  });
}
/** ========================================= */

/** ========= endpoints ========= */

// POST /api/quizzes/generate
// body: { patientId: string, descriptionIds?: string[], limitPerDesc?: number }
router.post("/generate", async (req, res) => {
  try {
    const { patientId, descriptionIds, limitPerDesc = 3 } = (req.body || {}) as {
      patientId?: string; descriptionIds?: string[]; limitPerDesc?: number;
    };
    if (!patientId) return res.status(400).json({ error: "patientId requerido" });
    if (!allowPatientContext(req, patientId)) return res.status(403).json({ error: "forbidden_patient" });

    const qSnap = await firestore.collection("descriptions").where("patientId", "==", patientId).get();
    const allDescs = qSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

    const selected = Array.isArray(descriptionIds) && descriptionIds.length
      ? allDescs.filter(d => descriptionIds.includes(d.id))
      : allDescs.slice(0, 5);

    if (!selected.length) return res.status(400).json({ error: "no_descriptions" });

    const pool = {
      people: uniq(allDescs.flatMap(d => normList((d as any)?.data?.people))),
      places: uniq(allDescs.flatMap(d => normList((d as any)?.data?.places))),
      events: uniq(allDescs.flatMap(d => normList((d as any)?.data?.events))),
      emotions: uniq(allDescs.flatMap(d => normList((d as any)?.data?.emotions))),
    };

    const items: QuizItem[] = [];
    for (const d of selected) {
      const pid = (d as any).id;
      const people   = normList((d as any)?.data?.people);
      const places   = normList((d as any)?.data?.places);
      const events   = normList((d as any)?.data?.events);
      const emotions = normList((d as any)?.data?.emotions);

      if (people.length)   { const it = buildMc("¿Quién aparece en la foto?",   people[0],   pool.people,   pid, "people");   if (it) items.push(it); }
      if (places.length)   { const it = buildMc("¿Dónde fue tomada la foto?",   places[0],   pool.places,   pid, "places");   if (it) items.push(it); }
      if (events.length)   { const it = buildMc("¿Qué estaba ocurriendo?",      events[0],   pool.events,   pid, "events");   if (it) items.push(it); }
      if (emotions.length) { const it = buildMc("¿Cómo te sentías?",            emotions[0], pool.emotions, pid, "emotions"); if (it) items.push(it); }

      while (items.filter(x => x.descriptionId === pid).length < Number(limitPerDesc)) {
        items.push({ id: mkId(), type: "yn", prompt: "¿Recuerdas esta foto?", weight: 0.5, descriptionId: pid });
      }
    }

    const finalItems = pickN(items, Math.max(4, Math.min(items.length, selected.length * Number(limitPerDesc))));

    const authUser = getAuthUser(req);
    const docRef = await firestore.collection("quizzes").add({
      patientId,
      createdBy: authUser?.uid || null,
      status: "open",
      items: finalItems,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const doc = await docRef.get();
    return res.status(201).json({ id: docRef.id, ...doc.data() });
  } catch (e: any) {
    console.error("[quizzes.generate]", e);
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

// GET /api/quizzes/:id
router.get("/:id", async (req, res) => {
  try {
    const doc = await firestore.collection("quizzes").doc(String(req.params.id)).get();
    if (!doc.exists) return res.status(404).json({ error: "quiz_not_found" });
    const data = doc.data() as any;
    if (!allowPatientContext(req, data.patientId)) return res.status(403).json({ error: "forbidden_patient" });
    return res.json({ id: doc.id, ...data });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

// POST /api/quizzes/:id/submit
// body: { answers: [{ itemId, answerIndex?: number, yn?: boolean }], reportId?: string }
router.post("/:id/submit", async (req, res) => {
  try {
    const ref = firestore.collection("quizzes").doc(String(req.params.id));
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "quiz_not_found" });

    const quiz = snap.data() as any;
    if (!allowPatientContext(req, quiz.patientId)) return res.status(403).json({ error: "forbidden_patient" });

    const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
    const map = new Map<string, any>();
    (quiz.items || []).forEach((it: any) => map.set(it.id, it));

    let correct = 0;
    let totalWeight = 0;

    for (const a of answers) {
      const it = map.get(a.itemId);
      if (!it) continue;
      const w = it.weight ?? 1;
      totalWeight += w;
      if (it.type === "mc") {
        if (typeof a.answerIndex === "number" && a.answerIndex === it.correctIndex) correct += w;
      } else if (it.type === "yn") {
        if (a.yn === true) correct += w; // Sí = recuerda
      }
    }

    const score = totalWeight > 0 ? correct / totalWeight : 0;
    const classification = classify(score);

    await ref.set({
      ...quiz,
      status: "completed",
      answers,
      score,
      classification,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    const reportId: string | undefined = req.body?.reportId || undefined;
    await attachQuizResultToReport({
      patientId: quiz.patientId,
      reportId,
      result: {
        quizId: ref.id,
        score,
        classification,
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      }
    });

    return res.json({ id: ref.id, score, classification });
  } catch (e: any) {
    console.error("[quizzes.submit]", e);
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

// GET /api/quizzes/patient/:patientId
router.get("/patient/:patientId", async (req, res) => {
  try {
    const patientId = String(req.params.patientId);
    if (!allowPatientContext(req, patientId)) return res.status(403).json({ error: "forbidden_patient" });

    const snap = await firestore.collection("quizzes")
      .where("patientId", "==", patientId)
      .orderBy("createdAt", "desc")
      .get();

    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

export default router;
