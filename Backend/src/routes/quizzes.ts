import { Router } from "express";
import { firestore } from "../firebaseAdmin";
import admin from "../firebaseAdmin";

const router = Router();

/** ==== helpers de auth ==== */
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

/** ==== utilidades ==== */
const mkId = () => Math.random().toString(36).slice(2, 10);
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

type QuizItem = {
  id: string;
  type: "mc" | "yn";
  prompt: string;
  options?: string[];
  correctIndex?: number;
  weight: number;
  field?: "hasEvents" | "hasPeople" | "hasPlaces" | "hasEmotions" | "hasDetails";
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
/** ========================================= */

/**
 * POST /api/quizzes/generate
 * body: { patientId: string, photoId?: string, limitPerDesc?: number }
 * Si envías photoId => genera el cuestionario SOLO para esa foto (requerimiento).
 * Si NO envías photoId => comportamiento anterior (rápido), pero se recomienda usar photoId.
 */
router.post("/generate", async (req, res) => {
  try {
    const { patientId, photoId, limitPerDesc = 5 } = (req.body || {}) as {
      patientId?: string; photoId?: string; limitPerDesc?: number;
    };
    if (!patientId) return res.status(400).json({ error: "patientId requerido" });
    if (!allowPatientContext(req, patientId)) return res.status(403).json({ error: "forbidden_patient" });

    const authUser = getAuthUser(req);

    let items: QuizItem[] = [];
    let photoData: any = null;

    if (photoId) {
      // ---- Generar por FOTO (caregiverAnswers como gabarito) ----
      const photoSnap = await firestore.collection("photos").doc(photoId).get();
      if (!photoSnap.exists) return res.status(404).json({ error: "photo_not_found" });
      photoData = photoSnap.data() as any;
      if (photoData.patientId !== patientId) {
        return res.status(403).json({ error: "photo_not_for_patient" });
      }

      const caregiverYN: Array<{ itemId: string; yn: boolean }> = photoData.caregiverAnswers || [];

      // Ítems Y/N para los 5 campos base
      const ynMap: Record<string, string> = {
        hasEvents: "¿Había un evento específico?",
        hasPeople: "¿Aparecen personas conocidas?",
        hasPlaces: "¿Reconoces el lugar?",
        hasEmotions: "¿Se expresa alguna emoción?",
        hasDetails: "¿Se describen detalles concretos?",
      };

      for (const item of caregiverYN) {
        if (ynMap[item.itemId]) {
          items.push({
            id: mkId(),
            type: "yn",
            prompt: ynMap[item.itemId],
            weight: 1,
            field: item.itemId as QuizItem["field"],
          });
        }
      }

      // Ítems MC a partir de data (si existe)
      const data = photoData?.data || {};
      const pools = {
        people: Array.isArray(data.people) ? data.people : [],
        places: Array.isArray(data.places) ? data.places : (data.places ? [String(data.places)] : []),
        events: Array.isArray(data.events) ? data.events : (data.events ? [String(data.events)] : []),
        emotions: Array.isArray(data.emotions) ? data.emotions : (data.emotions ? [String(data.emotions)] : []),
      };

      const addMc = (prompt: string, correct: string, pool: string[]) => {
        const distractors = pickN(pool.filter(v => v !== correct), 3);
        const options = uniq([correct, ...distractors]);
        if (options.length < 2) return;
        const shuffled = shuffle(options);
        const correctIndex = shuffled.findIndex(o => o === correct);
        items.push({ id: mkId(), type: "mc", prompt, options: shuffled, correctIndex, weight: 1 });
      };

      if (pools.people.length)  addMc("¿Quién aparece en la foto?", pools.people[0], pools.people);
      if (pools.places.length)  addMc("¿Dónde fue tomada la foto?", pools.places[0], pools.places);
      if (pools.events.length)  addMc("¿Qué estaba ocurriendo?",   pools.events[0], pools.events);
      if (pools.emotions.length)addMc("¿Cómo te sentías?",         pools.emotions[0], pools.emotions);

      // Limitar total
      if (items.length > Number(limitPerDesc)) items = items.slice(0, Number(limitPerDesc));
    } else {
      // ---- (fallback) Generación simple si no mandan photoId ----
      const descSnap = await firestore.collection("descriptions").where("patientId", "==", patientId).get();
      if (descSnap.empty) return res.status(400).json({ error: "no_descriptions" });

      // Pregunta genérica Y/N + algunas MC a partir de la primera descripción
      items = [
        { id: mkId(), type: "yn", prompt: "¿Recuerdas esta foto?", weight: 1, field: "hasDetails" },
      ];
    }

      const docRef = await firestore.collection("quizzes").add({
      patientId,
      photoId: photoId || null,
      photoUrl: photoData?.url || null,
      createdBy: authUser?.uid || null,
      status: "open",
      items,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });    // Enviar notificación al paciente
    await firestore.collection("notifications").add({
      targetUid: patientId,
      type: "NEW_QUIZ",
      message: photoId ? "Tu doctor ha creado un nuevo cuestionario sobre una foto" : "Tu doctor ha creado un nuevo cuestionario",
      payload: {
        quizId: docRef.id,
        photoId: photoId || null,
        photoUrl: photoData?.url || null
      },
      createdBy: authUser?.uid || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
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
    console.error("[quizzes.get] error fetching quiz by id", e);
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

    // Si el quiz está ligado a photoId, traemos caregiverAnswers para comparar en Y/N
    let caregiverYN: Array<{ itemId: string; yn: boolean }> = [];
    if (quiz.photoId) {
      const photoSnap = await firestore.collection("photos").doc(String(quiz.photoId)).get();
      if (photoSnap.exists) {
        caregiverYN = (photoSnap.data() as any)?.caregiverAnswers || [];
      }
    }
    const careMap = new Map<string, boolean>(caregiverYN.map(a => [a.itemId, !!a.yn]));

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
        // Comparación CON el cuidador si tenemos gabarito; si no, consideramos "sí" como acierto
        if (careMap.size > 0 && it.field) {
          const right = careMap.get(it.field);
          if (right === !!a.yn) correct += w;
        } else if (a.yn === true) {
          correct += w;
        }
      }
    }

    const score = totalWeight > 0 ? correct / totalWeight : 0;
    const classification = classify(score);

    await ref.set(
      {
        status: "completed",
        answers,
        score,
        classification,
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Agregados por paciente y por foto
    const reportRef = firestore.collection("reports").doc(quiz.patientId);
    await firestore.runTransaction(async (t) => {
      const rs = await t.get(reportRef);
      const data = rs.exists ? rs.data() : {};

      const count = (data?.count || 0) + 1;
      const sum = (data?.sum || 0) + Math.round(score * 100);
      const avgRecall = Math.round(sum / count);

      const perPhoto = data?.perPhoto || {};
      if (quiz.photoId) {
        const cur = perPhoto[quiz.photoId] || { count: 0, sum: 0, avg: 0 };
        cur.count += 1;
        cur.sum += Math.round(score * 100);
        cur.avg = Math.round(cur.sum / cur.count);
        perPhoto[quiz.photoId] = cur;
      }

      t.set(
        reportRef,
        {
          patientId: quiz.patientId,
          sum,
          count,
          avgRecall,
          perPhoto,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
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

    const snap = await firestore.collection("quizzes").where("patientId", "==", patientId).get();
    const items: any[] = [];
    snap.forEach((doc) => {
      const data = doc.data() as any;
      const createdAt = data.createdAt;
      let createdAtMillis = 0;
      if (createdAt?.toDate) createdAtMillis = createdAt.toDate().getTime();
      items.push({ id: doc.id, ...data, _createdAtMillis: createdAtMillis });
    });

    items.sort((a, b) => (b._createdAtMillis || 0) - (a._createdAtMillis || 0));
    items.forEach(i => delete i._createdAtMillis);

    return res.json(items);
  } catch (e: any) {
    console.error("[quizzes.patient] error listing quizzes for patient", e);
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

export default router;
