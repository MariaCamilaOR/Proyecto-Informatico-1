import { Router } from "express";
import { firestore } from "../firebaseAdmin";

const router = Router();

// GET /api/reports/patient/:id?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/patient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    // Avoid server-side ordering/range queries that require composite indexes.
    // Fetch by equality and apply time-range filtering and sorting in memory.
    const snap = await firestore.collection("reports").where("patientId", "==", id).get();
    const items: any[] = [];
    snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));

    const toMillis = (v: any) => {
      if (!v) return 0;
      if (v.toDate && typeof v.toDate === 'function') return v.toDate().getTime();
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
      const dt = new Date(v);
      return isNaN(dt.getTime()) ? 0 : dt.getTime();
    };

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
    // Log the error server-side for debugging
    // eslint-disable-next-line no-console
    console.error('[reports] error:', e?.message || String(e), e?.stack || '');
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// POST /api/reports - create a new report for a patient
router.post("/", async (req, res) => {
  try {
    const authUser = (req as any).user;
    if (!authUser) return res.status(401).json({ error: "missing_auth" });
    const roleRaw = String(authUser.role || "");
    const role = roleRaw.toLowerCase();
    // only doctor or caregiver may create reports
    if (role !== "doctor" && role !== "caregiver") return res.status(403).json({ error: "forbidden_role" });

    const { patientId, data, baseline } = req.body || {};
    if (!patientId || !data) return res.status(400).json({ error: "missing_fields" });

    const docRef = await firestore.collection("reports").add({
      patientId,
      data,
      baseline: baseline || null,
      createdBy: authUser.uid,
      createdAt: new Date(),
    });

    const doc = await docRef.get();
    return res.status(201).json({ id: docRef.id, ...doc.data() });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

export default router;
