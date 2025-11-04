import { Router } from "express";
import { firestore } from "../firebaseAdmin";
import admin from "../firebaseAdmin";

const router = Router();

// GET /api/patients - list all registered patients
router.get("/", async (req, res) => {
  try {
    const q = firestore.collection("users").where("role", "==", "patient");
    const snap = await q.get();
    const items: any[] = [];
    snap.forEach((doc) => {
      const data = doc.data() as any;
      items.push({ id: doc.id, displayName: data.displayName || null, email: data.email || null, assignedCaregiverId: data.assignedCaregiverId || null });
    });
    return res.json(items);
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("Error listing patients", e);
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

// POST /api/patients/:id/assign - assign the authenticated caregiver to the given patient
router.post("/:id/assign", async (req, res) => {
  try {
    const authUser = (req as any).user;
    if (!authUser) return res.status(401).json({ error: "missing_auth" });
    const roleRaw = String(authUser.role || "");
    const role = roleRaw.toLowerCase();
    if (role !== "caregiver") return res.status(403).json({ error: "forbidden_role" });

    const patientId = req.params.id;
    const caregiverId = authUser.uid;

    const patientRef = firestore.collection("users").doc(patientId);
    const caregiverRef = firestore.collection("users").doc(caregiverId);

    await firestore.runTransaction(async (tx) => {
      const patientSnap = await tx.get(patientRef);
      if (!patientSnap.exists) throw { status: 404, message: "patient_not_found" };
      const patientData = patientSnap.data() as any;
      const assigned = patientData.assignedCaregiverId;
      if (assigned && assigned !== caregiverId) {
        throw { status: 409, message: "already_assigned" };
      }

      // set assignedCaregiverId on patient and add patientId to caregiver.linkedPatientIds
      tx.set(patientRef, { assignedCaregiverId: caregiverId }, { merge: true });
      tx.set(caregiverRef, { linkedPatientIds: admin.firestore.FieldValue.arrayUnion(patientId) }, { merge: true });
    });

    return res.json({ ok: true, patientId, caregiverId });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Assign caregiver failed:", err);
    if (err && typeof err === "object" && (err.status === 404 || err.status === 409)) {
      return res.status(err.status).json({ error: err.message || String(err) });
    }
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

export default router;
