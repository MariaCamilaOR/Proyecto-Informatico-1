import { Router } from "express";
import { firestore } from "../firebaseAdmin";
import admin from "../firebaseAdmin";

const router = Router();

/**
 * POST /api/consultas
 * Crea una nueva consulta médica vinculada a una foto o paciente
 * body: { patientId, photoId?, notes, diagnosis }
 * Solo permitido para roles "doctor" y "caregiver"
 */
router.post("/", async (req, res) => {
  try {
    const authUser = (req as any).user;
    if (!authUser) return res.status(401).json({ error: "missing_auth" });
    const role = String(authUser.role || "").toLowerCase();
    if (role !== "doctor" && role !== "caregiver") 
      return res.status(403).json({ error: "forbidden_role" });

    const { patientId, photoId, notes, diagnosis, status = "pending", sectionA, sectionB, sectionC } = req.body || {};
    if (!patientId) return res.status(400).json({ error: "missing_patientId" });
    
    // Validar campos específicos para cuidador
    if (role === "caregiver") {
      if (!photoId) return res.status(400).json({ error: "missing_photoId" });
      if (!sectionA || !sectionB || !sectionC) {
        return res.status(400).json({ 
          error: "missing_sections",
          message: "Los cuidadores deben proporcionar las secciones A, B y C"
        });
      }
    } else if (!notes) {
      return res.status(400).json({ error: "missing_notes" });
    }

    // Verificar si el cuidador está vinculado al paciente
    if (role === "caregiver") {
      const isLinked = Array.isArray(authUser.linkedPatientIds) && 
        authUser.linkedPatientIds.includes(patientId);
      if (!isLinked) 
        return res.status(403).json({ error: "forbidden_patient" });
    }

    // Estructurar la consulta en formato ABC si es un cuidador
    let structuredNotes = notes;
    if (role === "caregiver") {
      const { sectionA, sectionB, sectionC } = req.body;
      structuredNotes = {
        sectionA: sectionA || "No especificado", // Descripción del problema o síntomas
        sectionB: sectionB || "No especificado", // Duración o frecuencia
        sectionC: sectionC || "No especificado", // Observaciones adicionales
        originalNotes: notes
      };
    }

    const consultaRef = await firestore.collection("consultas").add({
      patientId,
      createdBy: authUser.uid,
      createdByRole: role,
      photoId: photoId || null,
      notes: structuredNotes,
      diagnosis: diagnosis || "",
      status: status, // pending, reviewed, completed
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      doctorId: role === "doctor" ? authUser.uid : null,
      reviewedAt: null,
      completedAt: null
    });

    const doc = await consultaRef.get();
    return res.status(201).json({ id: consultaRef.id, ...doc.data() });
  } catch (e: any) {
    console.error("[consultas.post]", e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

/**
 * GET /api/consultas/patient/:id
 * Lista las consultas de un paciente (doctor, cuidador vinculado o el propio paciente)
 */
router.get("/patient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    const authUser = (req as any).user;
    if (!authUser) return res.status(401).json({ error: "missing_auth" });

    const role = String(authUser.role || "").toLowerCase();
    
    // Verificar permisos
    if (role === "patient" && authUser.uid !== id) {
      return res.status(403).json({ error: "forbidden_patient" });
    }
    if (role === "caregiver") {
      const isLinked = Array.isArray(authUser.linkedPatientIds) && 
        authUser.linkedPatientIds.includes(id);
      if (!isLinked) 
        return res.status(403).json({ error: "forbidden_patient" });
    }

    let query = firestore
      .collection("consultas")
      .where("patientId", "==", id)
      .orderBy("createdAt", "desc");

    if (status) {
      query = query.where("status", "==", status);
    }

    const snap = await query.get();
    const items = snap.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    return res.json(items);
  } catch (e: any) {
    console.error("[consultas.list]", e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

/**
 * GET /api/consultas/doctor/:doctorId
 * Lista las consultas asignadas a un doctor
 */
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.query;
    const authUser = (req as any).user;
    if (!authUser) return res.status(401).json({ error: "missing_auth" });

    if (authUser.uid !== doctorId || String(authUser.role).toLowerCase() !== "doctor") {
      return res.status(403).json({ error: "forbidden" });
    }

    let query = firestore
      .collection("consultas")
      .where("doctorId", "==", doctorId)
      .orderBy("createdAt", "desc");

    if (status) {
      query = query.where("status", "==", status);
    }

    const snap = await query.get();
    const items = snap.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    return res.json(items);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

/**
 * GET /api/consultas/:id
 * Obtiene una consulta específica
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const authUser = (req as any).user;
    if (!authUser) return res.status(401).json({ error: "missing_auth" });

    const doc = await firestore.collection("consultas").doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: "consulta_not_found" });

    const data = doc.data() as any;
    const role = String(authUser.role || "").toLowerCase();

    // Verificar permisos
    if (role === "patient" && authUser.uid !== data.patientId) {
      return res.status(403).json({ error: "forbidden" });
    }
    if (role === "caregiver") {
      const isLinked = Array.isArray(authUser.linkedPatientIds) && 
        authUser.linkedPatientIds.includes(data.patientId);
      if (!isLinked) 
        return res.status(403).json({ error: "forbidden" });
    }
    if (role === "doctor" && data.doctorId && data.doctorId !== authUser.uid) {
      return res.status(403).json({ error: "forbidden" });
    }

    return res.json({ id: doc.id, ...data });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

/**
 * PUT /api/consultas/:id/review
 * Permite a un doctor revisar y actualizar una consulta
 */
router.put("/:id/review", async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, status = "reviewed" } = req.body || {};
    const authUser = (req as any).user;
    
    if (!authUser) return res.status(401).json({ error: "missing_auth" });
    if (String(authUser.role).toLowerCase() !== "doctor") {
      return res.status(403).json({ error: "forbidden_role" });
    }

    const docRef = firestore.collection("consultas").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "consulta_not_found" });

    const data = doc.data() as any;
    if (data.doctorId && data.doctorId !== authUser.uid) {
      return res.status(403).json({ error: "forbidden" });
    }

    await docRef.update({
      doctorId: authUser.uid,
      diagnosis: diagnosis || "",
      status: status,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...(status === "completed" ? { completedAt: admin.firestore.FieldValue.serverTimestamp() } : {})
    });

    const updated = await docRef.get();
    return res.json({ id: updated.id, ...updated.data() });
  } catch (e: any) {
    console.error("[consultas.review]", e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

/**
 * POST /api/consultas/:id/respond
 * Permite al paciente responder a una consulta
 */
router.post("/:id/respond", async (req, res) => {
  try {
    const { id } = req.params;
    const { responses } = req.body || {};
    const authUser = (req as any).user;
    
    if (!authUser) return res.status(401).json({ error: "missing_auth" });
    if (String(authUser.role).toLowerCase() !== "patient") {
      return res.status(403).json({ error: "forbidden_role" });
    }

    const docRef = firestore.collection("consultas").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "consulta_not_found" });

    const data = doc.data() as any;
    if (data.patientId !== authUser.uid) {
      return res.status(403).json({ error: "forbidden" });
    }

    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({ error: "invalid_responses" });
    }

    // Guardar las respuestas del paciente
    await docRef.update({
      patientResponses: {
        ...responses,
        answeredAt: admin.firestore.FieldValue.serverTimestamp()
      },
      status: "in_progress", // Cambiar estado a en progreso
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updated = await docRef.get();
    return res.json({ id: updated.id, ...updated.data() });
  } catch (e: any) {
    console.error("[consultas.respond]", e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

export default router;
