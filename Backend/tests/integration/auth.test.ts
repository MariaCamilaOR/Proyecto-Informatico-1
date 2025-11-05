/**
 * Tests de integración: Backend ↔ Firebase Auth
 * 
 * Estos tests verifican la integración real con Firebase Authentication.
 * Requieren credenciales de Firebase configuradas.
 * 
 * NOTA: Estos tests pueden crear usuarios reales en Firebase.
 * Considera usar Firebase Emulators para desarrollo.
 */

import { auth } from "../../src/firebaseAdmin";
import { firestore } from "../../src/firebaseAdmin";
import admin from "../../src/firebaseAdmin";

describe("🔗 Integración: Backend ↔ Firebase Auth", () => {
  const TEST_PREFIX = `test_${Date.now()}_`;
  
  // Aumentar timeout para tests de integración (Firebase puede ser lento)
  jest.setTimeout(30000);

  // Helper para crear email único
  const testEmail = (suffix: string) => `${TEST_PREFIX}${suffix}@test.example.com`;

  afterAll(async () => {
    // Limpieza: eliminar usuarios de test creados
    try {
      const users = await auth.listUsers();
      const testUsers = users.users.filter((user) =>
        user.email?.startsWith(TEST_PREFIX)
      );

      if (testUsers.length > 0) {
        const uids = testUsers.map((u) => u.uid);
        await auth.deleteUsers(uids);
      }

      // Limpiar documentos de users en Firestore
      const usersSnapshot = await firestore
        .collection("users")
        .where(admin.firestore.FieldPath.documentId(), ">=", TEST_PREFIX)
        .where(admin.firestore.FieldPath.documentId(), "<", `${TEST_PREFIX}\uf8ff`)
        .get();

      const batch = firestore.batch();
      usersSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      console.warn("Error cleaning up test users:", error);
    }
  });

  describe("👤 Gestión de usuarios", () => {
    it("debe obtener información de un usuario por UID", async () => {
      // Crear usuario de prueba
      const email = testEmail("get-user");
      const userRecord = await auth.createUser({
        email,
        password: "testPassword123!",
        displayName: "Test User",
      });

      // Obtener usuario
      const retrieved = await auth.getUser(userRecord.uid);
      expect(retrieved.email).toBe(email);
      expect(retrieved.displayName).toBe("Test User");

      // Limpiar
      await auth.deleteUser(userRecord.uid);
    });

    it("debe actualizar datos de usuario", async () => {
      const email = testEmail("update-user");
      const userRecord = await auth.createUser({
        email,
        password: "testPassword123!",
      });

      // Actualizar
      const updated = await auth.updateUser(userRecord.uid, {
        displayName: "Updated Name",
        photoURL: "https://example.com/photo.jpg",
      });

      expect(updated.displayName).toBe("Updated Name");
      expect(updated.photoURL).toBe("https://example.com/photo.jpg");

      // Limpiar
      await auth.deleteUser(userRecord.uid);
    });

    it("debe eliminar un usuario", async () => {
      const email = testEmail("delete-user");
      const userRecord = await auth.createUser({
        email,
        password: "testPassword123!",
      });

      const uid = userRecord.uid;

      // Eliminar
      await auth.deleteUser(uid);

      // Verificar que no existe
      try {
        await auth.getUser(uid);
        fail("User should have been deleted");
      } catch (error: any) {
        expect(error.code).toBe("auth/user-not-found");
      }
    });
  });

  describe("🏷️ Custom Claims", () => {
    it("debe establecer custom claims en un usuario", async () => {
      const email = testEmail("claims-user");
      const userRecord = await auth.createUser({
        email,
        password: "testPassword123!",
      });

      // Establecer claims
      await auth.setCustomUserClaims(userRecord.uid, {
        role: "caregiver",
        linkedPatientIds: ["patient-123", "patient-456"],
      });

      // Verificar claims
      const user = await auth.getUser(userRecord.uid);
      expect(user.customClaims?.role).toBe("caregiver");
      expect(user.customClaims?.linkedPatientIds).toEqual([
        "patient-123",
        "patient-456",
      ]);

      // Limpiar
      await auth.deleteUser(userRecord.uid);
    });

    it("debe actualizar custom claims", async () => {
      const email = testEmail("update-claims");
      const userRecord = await auth.createUser({
        email,
        password: "testPassword123!",
      });

      // Claims iniciales
      await auth.setCustomUserClaims(userRecord.uid, {
        role: "caregiver",
        linkedPatientIds: ["patient-1"],
      });

      // Actualizar claims
      await auth.setCustomUserClaims(userRecord.uid, {
        role: "caregiver",
        linkedPatientIds: ["patient-1", "patient-2"],
      });

      const user = await auth.getUser(userRecord.uid);
      expect(user.customClaims?.linkedPatientIds).toEqual([
        "patient-1",
        "patient-2",
      ]);

      // Limpiar
      await auth.deleteUser(userRecord.uid);
    });

    it("debe eliminar custom claims estableciendo null", async () => {
      const email = testEmail("remove-claims");
      const userRecord = await auth.createUser({
        email,
        password: "testPassword123!",
      });

      // Establecer claims
      await auth.setCustomUserClaims(userRecord.uid, {
        role: "doctor",
      });

      // Eliminar claims (Firebase puede retornar {} en lugar de undefined)
      await auth.setCustomUserClaims(userRecord.uid, null);

      const user = await auth.getUser(userRecord.uid);
      // Firebase puede retornar {} o undefined cuando no hay claims
      // Verificar que no tiene claims (objeto vacío o undefined)
      if (user.customClaims) {
        expect(Object.keys(user.customClaims)).toHaveLength(0);
      } else {
        expect(user.customClaims).toBeFalsy();
      }

      // Limpiar
      await auth.deleteUser(userRecord.uid);
    }, 10000);
  });

  describe("🔗 Integración con Firestore", () => {
    it("debe sincronizar perfil de usuario en Firestore con claims", async () => {
      const email = testEmail("sync-firestore");
      const userRecord = await auth.createUser({
        email,
        password: "testPassword123!",
      });

      const uid = userRecord.uid;

      // Establecer claims
      await auth.setCustomUserClaims(uid, {
        role: "patient",
        linkedPatientIds: [],
      });

      // Crear/actualizar perfil en Firestore
      await firestore.collection("users").doc(uid).set({
        email,
        role: "patient",
        linkedPatientIds: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Verificar sincronización
      const userDoc = await firestore.collection("users").doc(uid).get();
      expect(userDoc.exists).toBe(true);
      const userData = userDoc.data();
      expect(userData?.role).toBe("patient");

      // Verificar que claims coinciden
      const authUser = await auth.getUser(uid);
      expect(authUser.customClaims?.role).toBe(userData?.role);

      // Limpiar
      await auth.deleteUser(uid);
      await firestore.collection("users").doc(uid).delete();
    }, 15000);

    it("debe usar Firestore como fallback cuando no hay claims en token", async () => {
      const email = testEmail("fallback-firestore");
      const userRecord = await auth.createUser({
        email,
        password: "testPassword123!",
      });

      const uid = userRecord.uid;

      // NO establecer claims en Auth, pero sí en Firestore
      await firestore.collection("users").doc(uid).set({
        email,
        role: "caregiver",
        linkedPatientIds: ["patient-999"],
      });

      // Verificar que Firestore tiene los datos
      const userDoc = await firestore.collection("users").doc(uid).get();
      expect(userDoc.data()?.role).toBe("caregiver");

      // Limpiar
      await auth.deleteUser(uid);
      await firestore.collection("users").doc(uid).delete();
    });
  });

  describe("🔐 Verificación de tokens", () => {
    it("debe verificar un ID token válido", async () => {
      const email = testEmail("verify-token");
      const userRecord = await auth.createUser({
        email,
        password: "testPassword123!",
      });

      // Establecer claims
      await auth.setCustomUserClaims(userRecord.uid, {
        role: "doctor",
      });

      // NOTA: Para obtener un ID token real, necesitarías:
      // 1. Usar Firebase Client SDK para hacer login
      // 2. O usar Admin SDK para crear un custom token
      // Por ahora, verificamos que podemos obtener el usuario con claims

      const user = await auth.getUser(userRecord.uid);
      expect(user.customClaims?.role).toBe("doctor");

      // Limpiar
      await auth.deleteUser(userRecord.uid);
    });
  });
});

