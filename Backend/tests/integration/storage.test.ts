/**
 * Tests de integración: Backend ↔ Firebase Storage
 * 
 * Estos tests verifican la integración real con Firebase Storage.
 * Requieren credenciales de Firebase configuradas.
 */

import { storage, firestore } from "../../src/firebaseAdmin";
import admin from "../../src/firebaseAdmin";

describe("🔗 Integración: Backend ↔ Firebase Storage", () => {
  const TEST_PREFIX = `test_${Date.now()}_`;
  
  // Aumentar timeout para tests de integración
  jest.setTimeout(30000);

  // Verificar si Storage está configurado
  const isStorageConfigured = () => {
    try {
      const bucket = storage.bucket();
      return bucket !== null;
    } catch {
      return false;
    }
  };

  afterAll(async () => {
    // Limpieza: eliminar archivos de test
    if (!isStorageConfigured()) return;
    
    try {
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles({ prefix: `photos/${TEST_PREFIX}` });
      await Promise.all(files.map((file) => file.delete().catch(() => {})));
    } catch (error) {
      console.warn("Error cleaning up storage test files:", error);
    }
  });

  describe("📤 Upload de archivos", () => {
    it("debe subir un archivo a Storage", async () => {
      if (!isStorageConfigured()) {
        console.warn("⚠️ Firebase Storage no configurado. Skipping storage tests.");
        return;
      }
      const bucket = storage.bucket();
      const testContent = Buffer.from("test image content");
      const testPath = `photos/${TEST_PREFIX}test-upload.jpg`;

      const file = bucket.file(testPath);
      await file.save(testContent, {
        contentType: "image/jpeg",
        metadata: {
          metadata: {
            patientId: `${TEST_PREFIX}patient-123`,
            uploadedBy: "test-user",
          },
        },
      });

      // Verificar que el archivo existe
      const [exists] = await file.exists();
      expect(exists).toBe(true);
    });

    it("debe obtener metadata del archivo subido", async () => {
      if (!isStorageConfigured()) {
        console.warn("⚠️ Firebase Storage no configurado. Skipping storage tests.");
        return;
      }
      const bucket = storage.bucket();
      const testPath = `photos/${TEST_PREFIX}test-metadata.jpg`;
      const file = bucket.file(testPath);

      await file.save(Buffer.from("test"), {
        contentType: "image/jpeg",
        metadata: {
          metadata: {
            patientId: `${TEST_PREFIX}patient-456`,
          },
        },
      });

      const [metadata] = await file.getMetadata();
      expect(metadata.contentType).toBe("image/jpeg");
      expect(metadata.metadata?.patientId).toBe(`${TEST_PREFIX}patient-456`);
    });
  });

  describe("🔗 Signed URLs", () => {
    it("debe generar una URL firmada para lectura", async () => {
      if (!isStorageConfigured()) {
        console.warn("⚠️ Firebase Storage no configurado. Skipping storage tests.");
        return;
      }
      const bucket = storage.bucket();
      const testPath = `photos/${TEST_PREFIX}test-signed-url.jpg`;
      const file = bucket.file(testPath);

      await file.save(Buffer.from("test content"), {
        contentType: "image/jpeg",
      });

      // Generar URL firmada (válida por 7 días)
      const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const [signedUrl] = await file.getSignedUrl({
        action: "read",
        expires,
      });

      expect(signedUrl).toBeDefined();
      expect(signedUrl).toContain("https://");
      expect(signedUrl).toContain("GoogleAccessId");
    });

    it("debe generar URL firmada con expiración personalizada", async () => {
      if (!isStorageConfigured()) {
        console.warn("⚠️ Firebase Storage no configurado. Skipping storage tests.");
        return;
      }
      const bucket = storage.bucket();
      const testPath = `photos/${TEST_PREFIX}test-expires.jpg`;
      const file = bucket.file(testPath);

      await file.save(Buffer.from("test"), { contentType: "image/jpeg" });

      // URL válida por 1 hora
      const expires = Date.now() + 60 * 60 * 1000;
      const [signedUrl] = await file.getSignedUrl({
        action: "read",
        expires,
      });

      expect(signedUrl).toBeDefined();
      // Verificar que la URL contiene el timestamp de expiración
      expect(signedUrl).toContain("Expires=");
    });
  });

  describe("🗑️ Eliminación de archivos", () => {
    it("debe eliminar un archivo de Storage", async () => {
      if (!isStorageConfigured()) {
        console.warn("⚠️ Firebase Storage no configurado. Skipping storage tests.");
        return;
      }
      const bucket = storage.bucket();
      const testPath = `photos/${TEST_PREFIX}test-delete.jpg`;
      const file = bucket.file(testPath);

      // Crear archivo
      await file.save(Buffer.from("test"), { contentType: "image/jpeg" });

      // Verificar que existe
      const [existsBefore] = await file.exists();
      expect(existsBefore).toBe(true);

      // Eliminar
      await file.delete();

      // Verificar que no existe
      const [existsAfter] = await file.exists();
      expect(existsAfter).toBe(false);
    });
  });

  describe("📋 Listar archivos", () => {
    it("debe listar archivos en un prefijo", async () => {
      if (!isStorageConfigured()) {
        console.warn("⚠️ Firebase Storage no configurado. Skipping storage tests.");
        return;
      }
      const bucket = storage.bucket();
      const prefix = `photos/${TEST_PREFIX}list/`;

      // Crear varios archivos
      for (let i = 0; i < 3; i++) {
        const file = bucket.file(`${prefix}file${i}.jpg`);
        await file.save(Buffer.from(`content ${i}`), {
          contentType: "image/jpeg",
        });
      }

      // Listar archivos
      const [files] = await bucket.getFiles({ prefix });

      expect(files.length).toBeGreaterThanOrEqual(3);
      files.forEach((file) => {
        expect(file.name).toContain(prefix);
      });
    });
  });

  describe("🔗 Integración con Firestore", () => {
    it("debe crear metadata en Firestore después de subir archivo", async () => {
      if (!isStorageConfigured()) {
        console.warn("⚠️ Firebase Storage no configurado. Skipping storage tests.");
        return;
      }
      const bucket = storage.bucket();
      const patientId = `${TEST_PREFIX}storage-firestore-patient`;
      const testPath = `photos/${patientId}/test-integration.jpg`;
      const file = bucket.file(testPath);

      // Subir archivo
      await file.save(Buffer.from("test image"), {
        contentType: "image/jpeg",
      });

      // Generar URL firmada
      const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const [signedUrl] = await file.getSignedUrl({
        action: "read",
        expires,
      });

      // Crear metadata en Firestore
      const docRef = await firestore.collection("photos").add({
        patientId,
        url: signedUrl,
        storagePath: testPath,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Verificar
      const doc = await docRef.get();
      expect(doc.exists).toBe(true);
      const data = doc.data();
      expect(data?.storagePath).toBe(testPath);
      expect(data?.url).toBe(signedUrl);
      expect(data?.patientId).toBe(patientId);
    });

    it("debe eliminar archivo y metadata cuando se elimina foto", async () => {
      if (!isStorageConfigured()) {
        console.warn("⚠️ Firebase Storage no configurado. Skipping storage tests.");
        return;
      }
      const bucket = storage.bucket();
      const patientId = `${TEST_PREFIX}delete-integration`;
      const testPath = `photos/${patientId}/test-delete.jpg`;
      const file = bucket.file(testPath);

      // Subir archivo
      await file.save(Buffer.from("test"), { contentType: "image/jpeg" });

      // Crear metadata
      const docRef = await firestore.collection("photos").add({
        patientId,
        storagePath: testPath,
        url: "https://example.com/test.jpg",
      });

      const docId = docRef.id;

      // Eliminar archivo de Storage
      await file.delete();

      // Eliminar metadata de Firestore
      await docRef.delete();

      // Verificar que ambos fueron eliminados
      const [fileExists] = await file.exists();
      expect(fileExists).toBe(false);

      const doc = await firestore.collection("photos").doc(docId).get();
      expect(doc.exists).toBe(false);
    });
  });
});

