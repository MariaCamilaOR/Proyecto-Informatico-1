/**
 * Tests de integración: Backend ↔ Firestore
 * 
 * Estos tests verifican la integración real con Firestore.
 * Requieren credenciales de Firebase configuradas o usar Firebase Emulators.
 * 
 * Para ejecutar solo estos tests:
 * npm test -- tests/integration/firestore.test.ts
 */

import { firestore } from "../../src/firebaseAdmin";
import admin from "../../src/firebaseAdmin";

describe("🔗 Integración: Backend ↔ Firestore", () => {
  // Prefijo para identificar documentos de test (fácil limpieza)
  const TEST_PREFIX = `test_${Date.now()}_`;
  
  // Aumentar timeout para tests de integración
  jest.setTimeout(30000);

  afterAll(async () => {
    // Limpieza: eliminar documentos de test creados
    try {
      const collections = ["photos", "descriptions", "patients", "reports", "users"];
      for (const collectionName of collections) {
        const snapshot = await firestore
          .collection(collectionName)
          .where(admin.firestore.FieldPath.documentId(), ">=", TEST_PREFIX)
          .where(admin.firestore.FieldPath.documentId(), "<", `${TEST_PREFIX}\uf8ff`)
          .get();

        const batch = firestore.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
    } catch (error) {
      console.warn("Error cleaning up test data:", error);
    }
  });

  describe("📄 CRUD básico", () => {
    it("debe crear un documento en Firestore", async () => {
      const testData = {
        patientId: `${TEST_PREFIX}patient-123`,
        url: "https://example.com/test-photo.jpg",
        description: "Test photo",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await firestore.collection("photos").add(testData);
      expect(docRef.id).toBeDefined();

      const doc = await docRef.get();
      expect(doc.exists).toBe(true);
      const data = doc.data();
      expect(data?.patientId).toBe(testData.patientId);
      expect(data?.url).toBe(testData.url);
    });

    it("debe leer un documento existente", async () => {
      // Crear documento de prueba
      const testData = {
        patientId: `${TEST_PREFIX}patient-456`,
        title: "Test Description",
        type: "text",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await firestore.collection("descriptions").add(testData);
      const docId = docRef.id;

      // Leer el documento
      const doc = await firestore.collection("descriptions").doc(docId).get();
      expect(doc.exists).toBe(true);
      expect(doc.data()?.title).toBe("Test Description");
    });

    it("debe actualizar un documento existente", async () => {
      // Crear documento
      const docRef = await firestore.collection("photos").add({
        patientId: `${TEST_PREFIX}patient-789`,
        url: "https://example.com/old.jpg",
      });

      // Actualizar
      await docRef.update({
        url: "https://example.com/new.jpg",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Verificar actualización
      const updated = await docRef.get();
      expect(updated.data()?.url).toBe("https://example.com/new.jpg");
      expect(updated.data()?.updatedAt).toBeDefined();
    });

    it("debe eliminar un documento", async () => {
      // Crear documento
      const docRef = await firestore.collection("photos").add({
        patientId: `${TEST_PREFIX}patient-delete`,
        url: "https://example.com/delete.jpg",
      });

      const docId = docRef.id;

      // Eliminar
      await docRef.delete();

      // Verificar que no existe
      const deleted = await docRef.get();
      expect(deleted.exists).toBe(false);
    });
  });

  describe("🔍 Queries", () => {
    it("debe buscar documentos por campo", async () => {
      const patientId = `${TEST_PREFIX}query-patient`;

      // Crear múltiples documentos
      await firestore.collection("photos").add({
        patientId,
        url: "https://example.com/photo1.jpg",
      });
      await firestore.collection("photos").add({
        patientId,
        url: "https://example.com/photo2.jpg",
      });
      await firestore.collection("photos").add({
        patientId: `${TEST_PREFIX}other-patient`,
        url: "https://example.com/photo3.jpg",
      });

      // Query por patientId
      const snapshot = await firestore
        .collection("photos")
        .where("patientId", "==", patientId)
        .get();

      expect(snapshot.size).toBe(2);
      snapshot.docs.forEach((doc) => {
        expect(doc.data().patientId).toBe(patientId);
      });
    });

    it("debe ordenar documentos por fecha", async () => {
      const patientId = `${TEST_PREFIX}sort-patient`;
      const now = Date.now();

      // Crear documentos con fechas diferentes
      await firestore.collection("photos").add({
        patientId,
        url: "photo1.jpg",
        createdAt: new Date(now - 2000),
      });
      await firestore.collection("photos").add({
        patientId,
        url: "photo2.jpg",
        createdAt: new Date(now - 1000),
      });
      await firestore.collection("photos").add({
        patientId,
        url: "photo3.jpg",
        createdAt: new Date(now),
      });

      // Query ordenado descendente
      const snapshot = await firestore
        .collection("photos")
        .where("patientId", "==", patientId)
        .orderBy("createdAt", "desc")
        .get();

      expect(snapshot.size).toBe(3);
      const urls = snapshot.docs.map((doc) => doc.data().url);
      expect(urls[0]).toBe("photo3.jpg"); // Más reciente primero
      expect(urls[2]).toBe("photo1.jpg"); // Más antiguo último
    });

    it("debe limitar resultados de query", async () => {
      const patientId = `${TEST_PREFIX}limit-patient`;

      // Crear 5 documentos
      for (let i = 0; i < 5; i++) {
        await firestore.collection("photos").add({
          patientId,
          url: `photo${i}.jpg`,
        });
      }

      // Query con límite
      const snapshot = await firestore
        .collection("photos")
        .where("patientId", "==", patientId)
        .limit(3)
        .get();

      expect(snapshot.size).toBe(3);
    });
  });

  describe("💾 Transacciones", () => {
    it("debe ejecutar una transacción exitosa", async () => {
      const patientId = `${TEST_PREFIX}tx-patient`;

      // Crear documento inicial
      const patientRef = firestore.collection("patients").doc(`${TEST_PREFIX}tx-001`);
      await patientRef.set({
        role: "patient",
        assignedCaregiverIds: [],
      });

      // Transacción: agregar caregiver
      await firestore.runTransaction(async (transaction) => {
        const patientDoc = await transaction.get(patientRef);
        if (!patientDoc.exists) {
          throw new Error("Patient not found");
        }

        const data = patientDoc.data() || {};
        const caregivers = data.assignedCaregiverIds || [];
        if (!caregivers.includes("caregiver-123")) {
          caregivers.push("caregiver-123");
          transaction.update(patientRef, {
            assignedCaregiverIds: admin.firestore.FieldValue.arrayUnion("caregiver-123"),
          });
        }
      });

      // Verificar
      const updated = await patientRef.get();
      const updatedData = updated.data();
      expect(updatedData?.assignedCaregiverIds).toContain("caregiver-123");
    });

    it("debe hacer rollback si la transacción falla", async () => {
      const patientId = `${TEST_PREFIX}tx-rollback`;

      const patientRef = firestore.collection("patients").doc(`${TEST_PREFIX}tx-rollback-001`);
      await patientRef.set({
        role: "patient",
        count: 0,
      });

      // Intentar transacción que falla
      try {
        await firestore.runTransaction(async (transaction) => {
          const doc = await transaction.get(patientRef);
          transaction.update(patientRef, { count: 10 });
          // Simular error
          throw new Error("Transaction error");
        });
        fail("Transaction should have failed");
      } catch (error: any) {
        expect(error.message).toBe("Transaction error");
      }

      // Verificar que el cambio no se aplicó
      const doc = await patientRef.get();
      expect(doc.data()?.count).toBe(0);
    });
  });

  describe("📊 Operaciones con arrays", () => {
    it("debe agregar elementos a un array usando arrayUnion", async () => {
      const patientRef = firestore.collection("patients").doc(`${TEST_PREFIX}array-001`);
      await patientRef.set({
        linkedPatientIds: ["patient-1"],
      });

      await patientRef.update({
        linkedPatientIds: admin.firestore.FieldValue.arrayUnion("patient-2", "patient-3"),
      });

      const doc = await patientRef.get();
      const linked = doc.data()?.linkedPatientIds || [];
      expect(linked).toContain("patient-1");
      expect(linked).toContain("patient-2");
      expect(linked).toContain("patient-3");
    });

    it("debe remover elementos de un array usando arrayRemove", async () => {
      const patientRef = firestore.collection("patients").doc(`${TEST_PREFIX}array-002`);
      await patientRef.set({
        linkedPatientIds: ["patient-1", "patient-2", "patient-3"],
      });

      await patientRef.update({
        linkedPatientIds: admin.firestore.FieldValue.arrayRemove("patient-2"),
      });

      const doc = await patientRef.get();
      const linked = doc.data()?.linkedPatientIds || [];
      expect(linked).toContain("patient-1");
      expect(linked).not.toContain("patient-2");
      expect(linked).toContain("patient-3");
    });
  });

  describe("⏱️ Timestamps", () => {
    it("debe usar serverTimestamp correctamente", async () => {
      const docRef = await firestore.collection("photos").add({
        patientId: `${TEST_PREFIX}timestamp-test`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const doc = await docRef.get();
      const data = doc.data();
      expect(data?.createdAt).toBeDefined();

      // Verificar que es un Timestamp de Firestore
      if (data?.createdAt?.toDate) {
        const date = data.createdAt.toDate();
        expect(date).toBeInstanceOf(Date);
        expect(date.getTime()).toBeLessThanOrEqual(Date.now());
      }
    });
  });
});

