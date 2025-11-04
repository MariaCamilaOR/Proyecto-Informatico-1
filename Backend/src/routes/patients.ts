import { Router } from "express";
import { firestore } from "../firebaseAdmin";
import admin from "../firebaseAdmin";

const router = Router();

// GET /api/patients - list all registered patients
router.get("/", async (req, res) => {
  try {
    const { email } = req.query || {};

    let snap;
    if (email && typeof email === "string") {
      // exact match by email
      const q = firestore.collection("users").where("email", "==", email);
      snap = await q.get();
    } else {
      // Be tolerant of role casing/variants stored in Firestore.
      // Use 'in' to match common variants (lowercase/uppercase/Titlecase).
      const roleVariants = ["patient", "PATIENT", "Patient"];

      // If your users collection uses a different schema, this query may need adjusting.
      const q = firestore.collection("users").where("role", "in", roleVariants);
      snap = await q.get();
    }

    const items: any[] = [];
    snap.forEach((doc) => {
      const data = doc.data() as any;
      items.push({ id: doc.id, displayName: data.displayName || null, email: data.email || null, assignedCaregiverId: data.assignedCaregiverId || null, raw: data });
    });

    // eslint-disable-next-line no-console
    console.log(`[patients] found ${items.length} patients`);

    return res.json(items);
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("Error listing patients", e);
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

// GET /api/patients/:id - get a single patient by id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await firestore.collection("users").doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: "patient_not_found" });
    const data = doc.data() as any;
    return res.json({ id: doc.id, displayName: data.displayName || null, email: data.email || null, assignedCaregiverId: data.assignedCaregiverId || null, raw: data });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("Error getting patient", e);
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

// POST /api/patients/assign-by-code - body { code }
router.post("/assign-by-code", async (req, res) => {
  try {
    const authUser = (req as any).user;
    if (!authUser) return res.status(401).json({ error: "missing_auth" });
    const roleRaw = String(authUser.role || "");
    const role = roleRaw.toLowerCase();
    if (role !== "caregiver") return res.status(403).json({ error: "forbidden_role" });

    const code = (req.body && req.body.code) || null;
    if (!code) return res.status(400).json({ error: "missing_code" });

    // Find patient by inviteCode (case-insensitive) or by id (allow UID passthrough)
    let patientDoc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> | null = null;
    // Try exact id first
    const byId = await firestore.collection("users").doc(String(code)).get();
    if (byId.exists) patientDoc = byId;
    else {
      const q = firestore.collection("users").where("inviteCode", "==", String(code).toUpperCase()).limit(1);
      const snap = await q.get();
      if (!snap.empty) patientDoc = snap.docs[0];
    }

    if (!patientDoc) return res.status(404).json({ error: "patient_not_found" });

    const patientId = patientDoc.id;
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
    console.error("Assign by code failed:", err);
    if (err && typeof err === "object" && (err.status === 404 || err.status === 409)) {
      return res.status(err.status).json({ error: err.message || String(err) });
    }
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

// POST /api/patients/:id/unassign - remove caregiver assignment for this patient (caregiver can unassign self)
router.post("/:id/unassign", async (req, res) => {
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
      if (!assigned) throw { status: 400, message: "not_assigned" };
      if (assigned !== caregiverId) throw { status: 403, message: "not_assigned_to_you" };

      // remove assignedCaregiverId and remove patientId from caregiver.linkedPatientIds
      tx.update(patientRef, { assignedCaregiverId: admin.firestore.FieldValue.delete() });
      tx.set(caregiverRef, { linkedPatientIds: admin.firestore.FieldValue.arrayRemove(patientId) }, { merge: true });
    });

    return res.json({ ok: true, patientId, caregiverId });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Unassign caregiver failed:", err);
    if (err && typeof err === "object" && (err.status === 404 || err.status === 400 || err.status === 403)) {
      return res.status(err.status).json({ error: err.message || String(err) });
    }
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

export default router;
