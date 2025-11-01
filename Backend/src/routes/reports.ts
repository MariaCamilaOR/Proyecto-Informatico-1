import { Router } from "express";
import { firestore } from "../firebaseAdmin";

const router = Router();

// GET /api/reports/patient/:id?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/patient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;

    let q: FirebaseFirestore.Query = firestore.collection("reports").where("patientId", "==", id);

    if (from) {
      const fromTs = new Date(from);
      q = q.where("createdAt", ">=", fromTs);
    }
    if (to) {
      const toTs = new Date(to);
      q = q.where("createdAt", "<=", toTs);
    }

    const snap = await q.orderBy("createdAt", "desc").get();
    const items: any[] = [];
    snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
    return res.json(items);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

export default router;
