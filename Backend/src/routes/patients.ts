import { Router } from "express";
import { firestore } from "../firebaseAdmin";
import admin from "../firebaseAdmin";

const router = Router();

// GET /api/patients - list all registered patients
router.get("/", async (req, res) => {
  try {
    const { email, q } = req.query || {};

    // Fetch patients by role variants
    const roleVariants = ["patient", "PATIENT", "Patient"];
    const snap = await firestore.collection("users").where("role", "in", roleVariants).get();

    const items: any[] = [];
    snap.forEach((doc) => {
      const data = doc.data() as any;
      items.push({
        id: doc.id,
        displayName: data.displayName || null,
        email: data.email || null,
        assignedCaregiverId: data.assignedCaregiverId || null,
        assignedDoctorId: data.assignedDoctorId || null,
        raw: data,
      });
    });

    // eslint-disable-next-line no-console
    console.log(`[patients] found ${items.length} patients`);

    let filtered = items;

    // Exact email filter (backwards compatible)
    if (email && typeof email === "string") {
      filtered = filtered.filter((it) => String(it.email || "").toLowerCase() === String(email).toLowerCase());
    }

    // Partial, case-insensitive search via `q` param
    if (q && typeof q === "string") {
      const qLower = q.toLowerCase();
      filtered = filtered.filter((it) => {
        const email = String(it.email || "").toLowerCase();
        const name = String(it.displayName || "").toLowerCase();
        return email.includes(qLower) || name.includes(qLower);
      });
    }

    return res.json(filtered);
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("Error listing patients", e);
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

// GET /api/patients/caregiver/:id - list patients assigned to a caregiver
router.get("/caregiver/:id", async (req, res) => {
  try {
    const caregiverId = req.params.id;
    if (!caregiverId) return res.status(400).json({ error: "missing_caregiver_id" });

    const roleVariants = ["patient", "PATIENT", "Patient"];
    const snap = await firestore.collection("users").where("role", "in", roleVariants).where("assignedCaregiverId", "==", caregiverId).get();

    const items: any[] = [];
    snap.forEach((doc) => {
      const data = doc.data() as any;
      items.push({
        id: doc.id,
        displayName: data.displayName || null,
        email: data.email || null,
        assignedCaregiverId: data.assignedCaregiverId || null,
        assignedDoctorId: data.assignedDoctorId || null,
        raw: data,
      });
    });

    return res.json(items);
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("Error listing caregiver patients", e);
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
    // Ensure the requested user actually has a patient role. If not, respond as not found.
    const role = String(data.role || "").toLowerCase();
    if (role !== "patient") return res.status(404).json({ error: "patient_not_found" });
    return res.json({
      id: doc.id,
      displayName: data.displayName || null,
      email: data.email || null,
      assignedCaregiverId: data.assignedCaregiverId || null,
      assignedDoctorId: data.assignedDoctorId || null,
      raw: data,
    });
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

// POST /api/patients/:id/assign-doctor - assign the authenticated doctor to the given patient
router.post("/:id/assign-doctor", async (req, res) => {
  try {
    const authUser = (req as any).user;
    if (!authUser) return res.status(401).json({ error: "missing_auth" });
    const roleRaw = String(authUser.role || "");
    const role = roleRaw.toLowerCase();
    if (role !== "doctor") return res.status(403).json({ error: "forbidden_role" });

    const patientId = req.params.id;
    const doctorId = authUser.uid;

    const patientRef = firestore.collection("users").doc(patientId);
    const doctorRef = firestore.collection("users").doc(doctorId);

    await firestore.runTransaction(async (tx) => {
      const patientSnap = await tx.get(patientRef);
      if (!patientSnap.exists) throw { status: 404, message: "patient_not_found" };
      const patientData = patientSnap.data() as any;
      const assigned = patientData.assignedDoctorId;
      if (assigned && assigned !== doctorId) {
        throw { status: 409, message: "already_assigned_to_another_doctor" };
      }

      // set assignedDoctorId on patient and add patientId to doctor.linkedPatientIds
      tx.set(patientRef, { assignedDoctorId: doctorId }, { merge: true });
      tx.set(doctorRef, { linkedPatientIds: admin.firestore.FieldValue.arrayUnion(patientId) }, { merge: true });
    });

    return res.json({ ok: true, patientId, doctorId });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Assign doctor failed:", err);
    if (err && typeof err === "object" && (err.status === 404 || err.status === 409)) {
      return res.status(err.status).json({ error: err.message || String(err) });
    }
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

// POST /api/patients/:id/unassign-doctor - remove doctor assignment for this patient (doctor can unassign self)
router.post("/:id/unassign-doctor", async (req, res) => {
  try {
    const authUser = (req as any).user;
    if (!authUser) return res.status(401).json({ error: "missing_auth" });
    const roleRaw = String(authUser.role || "");
    const role = roleRaw.toLowerCase();
    if (role !== "doctor") return res.status(403).json({ error: "forbidden_role" });

    const patientId = req.params.id;
    const doctorId = authUser.uid;

    const patientRef = firestore.collection("users").doc(patientId);
    const doctorRef = firestore.collection("users").doc(doctorId);

    await firestore.runTransaction(async (tx) => {
      const patientSnap = await tx.get(patientRef);
      if (!patientSnap.exists) throw { status: 404, message: "patient_not_found" };
      const patientData = patientSnap.data() as any;
      const assigned = patientData.assignedDoctorId;
      if (!assigned) throw { status: 400, message: "not_assigned" };
      if (assigned !== doctorId) throw { status: 403, message: "not_assigned_to_you" };

      // remove assignedDoctorId and remove patientId from doctor.linkedPatientIds
      tx.update(patientRef, { assignedDoctorId: admin.firestore.FieldValue.delete() });
      tx.set(doctorRef, { linkedPatientIds: admin.firestore.FieldValue.arrayRemove(patientId) }, { merge: true });
    });

    return res.json({ ok: true, patientId, doctorId });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Unassign doctor failed:", err);
    if (err && typeof err === "object" && (err.status === 404 || err.status === 400 || err.status === 403)) {
      return res.status(err.status).json({ error: err.message || String(err) });
    }
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

export default router;
