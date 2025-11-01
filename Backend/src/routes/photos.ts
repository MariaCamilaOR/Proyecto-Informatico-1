import { Router } from "express";
import { firestore, storage } from "../firebaseAdmin";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/photos/patient/:id
router.get("/patient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q = firestore.collection("photos").where("patientId", "==", id).orderBy("createdAt", "desc");
    const snap = await q.get();
    const items: any[] = [];
    snap.forEach((doc) => {
      const data = doc.data() as any;
      const createdAt = data.createdAt;
      let createdAtIso: string | null = null;
      if (createdAt && typeof createdAt.toDate === "function") {
        createdAtIso = createdAt.toDate().toISOString();
      } else if (createdAt instanceof Date) {
        createdAtIso = createdAt.toISOString();
      } else if (typeof createdAt === "string") {
        createdAtIso = createdAt;
      }
        items.push({ id: doc.id, ...data, createdAt: createdAtIso });
      });
      // Generate fresh signed URLs for any item that has a storagePath.
      // This avoids relying on previously-stored signed URLs which may have expired.
      const bucket = storage.bucket();
      const withUrls = await Promise.all(
        items.map(async (it) => {
          if (it.storagePath) {
            try {
              const file = bucket.file(it.storagePath);
              // create a short-lived signed url (7 days)
              const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
              const [signedUrl] = await file.getSignedUrl({ action: "read", expires });
              return { ...it, url: signedUrl };
            } catch (err) {
              // if signing fails, log and return item without url
              // eslint-disable-next-line no-console
              console.warn("Could not create signed url for", it.storagePath, err && (err as any).message);
              return { ...it, url: null };
            }
          }
          return it;
        })
      );

      return res.json(withUrls);
  } catch (e: any) {
    // log full error to console for easier debugging
    // eslint-disable-next-line no-console
    console.error("Error in GET /api/photos/patient/:id", e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// POST /api/photos - create photo metadata only
router.post("/", async (req, res) => {
  try {
    const body = req.body || {};
    const { patientId, url, storagePath, description, tags } = body;
    if (!patientId || (!url && !storagePath)) return res.status(400).json({ error: "missing_fields" });

    const docRef = await firestore.collection("photos").add({
      patientId,
      url: url || null,
      storagePath: storagePath || null,
      description: description || null,
      tags: tags || [],
      createdAt: new Date()
    });

    const doc = await docRef.get();
    const data = doc.data() as any;
    const createdAt = data.createdAt;
    let createdAtIso: string | null = null;
    if (createdAt && typeof createdAt.toDate === "function") {
      createdAtIso = createdAt.toDate().toISOString();
    } else if (createdAt instanceof Date) {
      createdAtIso = createdAt.toISOString();
    } else if (typeof createdAt === "string") {
      createdAtIso = createdAt;
    }
    return res.status(201).json({ id: docRef.id, ...data, createdAt: createdAtIso });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// POST /api/photos/upload - multipart upload: files + patientId
router.post("/upload", upload.array("files", 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    const patientId = (req.body.patientId as string) || (req.body.patientId && String(req.body.patientId));
    if (!files || files.length === 0) return res.status(400).json({ error: "no_files" });
    if (!patientId) return res.status(400).json({ error: "missing_patientId" });

    const bucket = storage.bucket();
    const created: any[] = [];

    for (const file of files) {
      const id = uuidv4();
      const filename = `${Date.now()}_${file.originalname}`;
      const destPath = `photos/${patientId}/${filename}`;

      const f = bucket.file(destPath);
      await f.save(file.buffer, { contentType: file.mimetype });

      // We persist the storagePath and generate signed URLs dynamically on read.
      const docRef = await firestore.collection("photos").add({
        patientId,
        url: null,
        storagePath: destPath,
        description: null,
        tags: [],
        createdAt: new Date()
      });

      const doc = await docRef.get();
      const data = doc.data() as any;
      const createdAt = data.createdAt;
      let createdAtIso: string | null = null;
      if (createdAt && typeof createdAt.toDate === "function") {
        createdAtIso = createdAt.toDate().toISOString();
      } else if (createdAt instanceof Date) {
        createdAtIso = createdAt.toISOString();
      } else if (typeof createdAt === "string") {
        createdAtIso = createdAt;
      }
      created.push({ id: docRef.id, ...data, createdAt: createdAtIso });
    }

    return res.status(201).json(created);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// DELETE /api/photos/:id - remove metadata and storage file (if present)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = firestore.collection("photos").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "not_found" });
    const data = doc.data() as any;
    // delete storage object if storagePath present
    if (data && data.storagePath) {
      try {
        const file = storage.bucket().file(data.storagePath);
        await file.delete();
      } catch (err) {
        // non-fatal: log and continue with metadata deletion
        // eslint-disable-next-line no-console
        console.warn("Failed to delete storage file", data.storagePath, (err as any).message || err);
      }
    }
    await docRef.delete();
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// PUT /api/photos/:id - update metadata
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body || {};
    await firestore.collection("photos").doc(id).set(update, { merge: true });
    const doc = await firestore.collection("photos").doc(id).get();
    return res.json({ id: doc.id, ...doc.data() });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

export default router;
