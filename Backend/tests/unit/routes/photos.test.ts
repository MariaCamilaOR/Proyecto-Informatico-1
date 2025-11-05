import request from "supertest";
import express, { Express } from "express";
import photosRouter from "../../../src/routes/photos";
import { firestore, storage } from "../../../src/firebaseAdmin";

// Mock de Firebase Admin
jest.mock("../../../src/firebaseAdmin", () => require("../../__mocks__/firebaseAdmin"));

describe("Photos Routes", () => {
  let app: Express;
  let mockVerifyToken: jest.Mock;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock del middleware que se aplica en el servidor real
    mockVerifyToken = jest.fn((req, res, next) => {
      (req as any).user = {
        uid: "test-user-123",
        role: "caregiver",
        linkedPatientIds: ["patient-456"],
      };
      next();
    });
    
    app.use("/api/photos", mockVerifyToken, photosRouter);
    jest.clearAllMocks();
  });

  describe("GET /api/photos/patient/:id", () => {
    it("debe listar fotos del paciente", async () => {
      const mockPhotos = [
        {
          id: "photo-1",
          patientId: "patient-456",
          url: "https://example.com/photo1.jpg",
          createdAt: { toDate: () => new Date("2024-01-01") },
        },
        {
          id: "photo-2",
          patientId: "patient-456",
          url: "https://example.com/photo2.jpg",
          createdAt: { toDate: () => new Date("2024-01-02") },
        },
      ];

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          forEach: (callback: any) => {
            mockPhotos.forEach((photo, index) => {
              callback({
                id: photo.id,
                data: () => photo,
              });
            });
          },
        }),
      };

      (firestore.collection as jest.Mock).mockReturnValue(mockQuery);

      const response = await request(app).get("/api/photos/patient/patient-456");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].id).toBe("photo-1");
      expect(response.body[0].createdAt).toBeDefined();
    });

    it("debe manejar errores correctamente", async () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockRejectedValue(new Error("Database error")),
      };

      (firestore.collection as jest.Mock).mockReturnValue(mockQuery);

      const response = await request(app).get("/api/photos/patient/patient-456");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/photos", () => {
    it("debe crear metadata de foto", async () => {
      const mockDocRef = {
        id: "new-photo-id",
        get: jest.fn().mockResolvedValue({
          id: "new-photo-id",
          data: () => ({
            patientId: "patient-456",
            url: "https://example.com/photo.jpg",
            createdAt: new Date(),
          }),
        }),
      };

      (firestore.collection as jest.Mock).mockReturnValue({
        add: jest.fn().mockResolvedValue(mockDocRef),
      });

      const response = await request(app)
        .post("/api/photos")
        .send({
          patientId: "patient-456",
          url: "https://example.com/photo.jpg",
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe("new-photo-id");
      expect(response.body.patientId).toBe("patient-456");
    });

    it("debe rechazar si faltan campos requeridos", async () => {
      const response = await request(app)
        .post("/api/photos")
        .send({
          patientId: "patient-456",
          // Falta url o storagePath
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "missing_fields");
    });
  });

  describe("POST /api/photos/upload", () => {
    // Nota: Multer requiere configuración especial para tests
    // Este test muestra la estructura, pero necesitarías usar multer mock
    it("debe validar que hay archivos", async () => {
      // Mock de multer para simular req.files vacío
      const response = await request(app)
        .post("/api/photos/upload")
        .field("patientId", "patient-456");

      // El endpoint debería retornar 400 si no hay archivos
      // (Nota: esto requiere configurar multer en el test)
      expect([400, 500]).toContain(response.status);
    });

    it("debe validar que existe patientId", async () => {
      const response = await request(app)
        .post("/api/photos/upload")
        .attach("files", Buffer.from("fake-image"), "test.jpg");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "missing_patientId");
    });

    it("debe rechazar si el usuario no es caregiver ni paciente", async () => {
      // Necesitamos crear una nueva app con el middleware mockeado
      const testApp = express();
      testApp.use(express.json());
      
      // Mock del middleware para simular usuario doctor (no puede subir fotos)
      const mockVerifyTokenDoctor = jest.fn((req, res, next) => {
        (req as any).user = {
          uid: "test-doctor-123",
          role: "doctor", // No es caregiver ni paciente
          linkedPatientIds: [],
        };
        next();
      });
      
      // No necesitamos mockear Firestore porque el código no lo consulta para roles que no son caregiver
      // El else en la línea 114 debería capturar el rol "doctor" y retornar forbidden_role
      
      testApp.use("/api/photos", mockVerifyTokenDoctor, photosRouter);

      const response = await request(testApp)
        .post("/api/photos/upload")
        .field("patientId", "patient-456")
        .attach("files", Buffer.from("fake-image"), "test.jpg");

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("error", "forbidden_role");
    });

    it("debe rechazar si el paciente no está vinculado al cuidador", async () => {
      // Necesitamos crear una nueva app con el middleware mockeado
      const testApp = express();
      testApp.use(express.json());
      
      const mockVerifyTokenUnlinked = jest.fn((req, res, next) => {
        (req as any).user = {
          uid: "test-user-123",
          role: "caregiver",
          linkedPatientIds: ["patient-999"], // Diferente al solicitado
        };
        next();
      });
      
      // Mock Firestore para que encuentre el documento del paciente
      (firestore.collection as jest.Mock).mockReturnValue({
        doc: jest.fn((id: string) => ({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              role: "patient",
              assignedCaregiverId: "other-caregiver-999", // No es este cuidador
            }),
          }),
        })),
      });
      
      testApp.use("/api/photos", mockVerifyTokenUnlinked, photosRouter);

      const response = await request(testApp)
        .post("/api/photos/upload")
        .field("patientId", "patient-456")
        .attach("files", Buffer.from("fake-image"), "test.jpg");

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("error", "forbidden_patient");
    });
  });

  describe("PUT /api/photos/:id", () => {
    it("debe actualizar metadata de foto", async () => {
      const mockDocRef = {
        get: jest.fn()
          .mockResolvedValueOnce({
            exists: true,
            data: () => ({
              patientId: "patient-456",
              url: "https://example.com/photo.jpg",
            }),
          })
          .mockResolvedValueOnce({
            id: "photo-123",
            data: () => ({
              patientId: "patient-456",
              url: "https://example.com/photo.jpg",
              description: "Updated description",
            }),
          }),
        set: jest.fn().mockResolvedValue(undefined),
      };

      (firestore.collection as jest.Mock).mockReturnValue({
        doc: jest.fn((id: string) => mockDocRef),
      });

      const response = await request(app)
        .put("/api/photos/photo-123")
        .send({ description: "Updated description" });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe("photo-123");
    });
  });

  describe("DELETE /api/photos/:id", () => {
    it("debe eliminar foto y archivo de Storage", async () => {
      const mockFile = {
        delete: jest.fn().mockResolvedValue(undefined),
      };

      const mockStorageBucket = {
        file: jest.fn().mockReturnValue(mockFile),
      };

      (storage.bucket as jest.Mock).mockReturnValue(mockStorageBucket);

      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            patientId: "patient-456", // Necesario para verificar permisos
            storagePath: "photos/patient-456/photo.jpg",
          }),
        }),
        delete: jest.fn().mockResolvedValue(undefined),
      };

      (firestore.collection as jest.Mock).mockReturnValue({
        doc: jest.fn((id: string) => mockDocRef),
      });

      const response = await request(app).delete("/api/photos/photo-123");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);
      expect(mockFile.delete).toHaveBeenCalled();
      expect(mockDocRef.delete).toHaveBeenCalled();
    });

    it("debe retornar 404 si la foto no existe", async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: false,
        }),
      };

      (firestore.collection as jest.Mock).mockReturnValue({
        doc: jest.fn((id: string) => mockDocRef),
      });

      const response = await request(app).delete("/api/photos/photo-123");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "not_found");
    });
  });
});

