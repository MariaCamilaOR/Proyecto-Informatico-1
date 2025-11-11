import { Router } from "express";
import { firestore, storage } from "../firebaseAdmin";
import multer from "multer";
import admin from "../firebaseAdmin";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const roleOf = (u: any) => String(u?.role || "").toLowerCase();
const isLinked = (u: any, patientId: string) =>
  Array.isArray(u?.linkedPatientIds) && u.linkedPatientIds.includes(patientId);

/** Lectura:
 *  - doctor/caregiver: solo si están vinculados al paciente
 *  - patient: solo si es su propio id
 */
router.get("/patient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const role = roleOf(user);

    console.log('[photos] Request for patient photos', { requestedPatient: id, user, role, SKIP_AUTH: process.env.SKIP_AUTH });

    // En desarrollo, permitimos acceso para pruebas
    if (process.env.SKIP_AUTH !== "true") {
      if ((role === "doctor" || role === "caregiver") && !isLinked(user, id)) {
        return res.status(403).json({ error: "forbidden_patient" });
      }
      if (role === "patient" && user?.uid !== id) {
        return res.status(403).json({ error: "forbidden_patient" });
      }
    }
    console.log("Access granted to photos for user:", { role, userId: user?.uid, patientId: id });

    const q = firestore.collection("photos").where("patientId", "==", id).orderBy("createdAt", "desc");
    const snap = await q.get();
    const items: any[] = [];
    snap.forEach((doc) => {
      const data = doc.data() as any;
      const createdAt = data.createdAt;
      let createdAtIso: string | null = null;
      if (createdAt && typeof createdAt.toDate === "function") createdAtIso = createdAt.toDate().toISOString();
      else if (createdAt instanceof Date) createdAtIso = createdAt.toISOString();
      else if (typeof createdAt === "string") createdAtIso = createdAt;
      items.push({ id: doc.id, ...data, createdAt: createdAtIso });
    });
    return res.json(items);
  } catch (e: any) {
    console.error("Error in GET /api/photos/patient/:id", e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

/** Crear metadata (sin archivo):
 *  - SOLO caregiver
 *  - patientId debe estar en linkedPatientIds del caregiver
 *  - explícitamente NO permitir patientId === uid del caregiver
 */
router.post("/", async (req, res) => {
  try {
    const user = (req as any).user;
    const role = roleOf(user);
    if (role !== "caregiver") return res.status(403).json({ error: "forbidden_role" });

    const body = req.body || {};
    const { patientId, url, storagePath, description, tags } = body;
    if (!patientId || (!url && !storagePath)) return res.status(400).json({ error: "missing_fields" });
    if (!isLinked(user, patientId)) return res.status(403).json({ error: "forbidden_patient" });
    if (patientId === user.uid) return res.status(403).json({ error: "patient_must_not_be_caregiver_uid" });

    const docRef = await firestore.collection("photos").add({
      patientId,
      url: url || null,
      storagePath: storagePath || null,
      description: description || null,
      tags: tags || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const doc = await docRef.get();
    const data = doc.data() as any;
    const createdAt = data.createdAt;
    let createdAtIso: string | null = null;
    if (createdAt && typeof createdAt.toDate === "function") createdAtIso = createdAt.toDate().toISOString();
    else if (createdAt instanceof Date) createdAtIso = createdAt.toISOString();
    else if (typeof createdAt === "string") createdAtIso = createdAt;

    return res.status(201).json({ id: docRef.id, ...data, createdAt: createdAtIso });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

/** Subir archivos a Storage:
 *  - SOLO caregiver vinculado al patientId
 *  - guarda metadata para ese patientId (nunca para el uid del caregiver)
 */
router.post("/upload", upload.array("files", 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    const patientId = (req.body.patientId as string) || (req.body.patientId && String(req.body.patientId));
    if (!files || files.length === 0) return res.status(400).json({ error: "no_files" });
    if (!patientId) return res.status(400).json({ error: "missing_patientId" });

    const user = (req as any).user;
    const role = roleOf(user);
    console.log('[photos/upload] upload attempt', { user, role, patientId, SKIP_AUTH: process.env.SKIP_AUTH });

    // In dev/demo mode allow demo caregiver to upload (skip strict checks)
    if (process.env.SKIP_AUTH !== "true") {
      if (role !== "caregiver") return res.status(403).json({ error: "forbidden_role" });
      if (!isLinked(user, patientId)) return res.status(403).json({ error: "forbidden_patient" });
      if (patientId === user.uid) return res.status(403).json({ error: "patient_must_not_be_caregiver_uid" });
    }

    const bucket = storage.bucket();
    const created: any[] = [];

    for (const file of files) {
      const filename = `${Date.now()}_${file.originalname}`;
      const destPath = `photos/${patientId}/${filename}`;

      const f = bucket.file(destPath);
      await f.save(file.buffer, { contentType: file.mimetype });

      // URL firmada por 7 días (ajústalo si quieres)
      const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const [signedUrl] = await f.getSignedUrl({ action: "read", expires });

      const docRef = await firestore.collection("photos").add({
        patientId,
        url: signedUrl,
        storagePath: destPath,
        description: null,
        tags: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const doc = await docRef.get();
      const data = doc.data() as any;
      const createdAt = data.createdAt;
      let createdAtIso: string | null = null;
      if (createdAt && typeof createdAt.toDate === "function") createdAtIso = createdAt.toDate().toISOString();
      else if (createdAt instanceof Date) createdAtIso = createdAt.toISOString();
      else if (typeof createdAt === "string") createdAtIso = createdAt;

      created.push({ id: docRef.id, ...data, createdAt: createdAtIso });
    }

    return res.status(201).json(created);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

/** Editar metadata:
 *  - SOLO caregiver vinculado al owner (patientId de la foto)
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const role = roleOf(user);
    if (role !== "caregiver") return res.status(403).json({ error: "forbidden_role" });

    const docRef = firestore.collection("photos").doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return res.status(404).json({ error: "not_found" });

    const data = snap.data() as any;
    if (!isLinked(user, data.patientId)) return res.status(403).json({ error: "forbidden_patient" });

    const update = req.body || {};
    await docRef.set(update, { merge: true });

    const updated = await docRef.get();
    return res.json({ id: updated.id, ...updated.data() });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

/** Borrar:
 *  - SOLO caregiver vinculado al owner (patientId de la foto)
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const role = roleOf(user);
    if (role !== "caregiver") return res.status(403).json({ error: "forbidden_role" });

    const docRef = firestore.collection("photos").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "not_found" });

    const data = doc.data() as any;
    if (!isLinked(user, data.patientId)) return res.status(403).json({ error: "forbidden_patient" });

    if (data?.storagePath) {
      try {
        await storage.bucket().file(data.storagePath).delete();
      } catch (err) {
        console.warn("Failed to delete storage file", data.storagePath, (err as any).message || err);
      }
    }
    await docRef.delete();
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

export default router;
