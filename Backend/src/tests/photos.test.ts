/**
 * src/tests/photos.test.ts
 * Pruebas unitarias del módulo de fotos.
 */

import express from "express";
import request from "supertest";
import photosRouter from "../routes/photos";

// Mocks de Firebase
jest.mock("../firebaseAdmin", () => {
  const mockCollection = jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      forEach: (cb: any) => {
        cb({
          id: "123",
          data: () => ({
            patientId: "p001",
            url: "https://fake.com/img.jpg",
            createdAt: new Date(),
          }),
        });
      },
    }),
    add: jest.fn().mockResolvedValue({
      id: "456",
      get: jest.fn().mockResolvedValue({
        id: "456",
        data: () => ({
          patientId: "p001",
          url: "https://fake.com/img.jpg",
          createdAt: new Date(),
        }),
      }),
    }),
    doc: jest.fn().mockReturnValue({
      set: jest.fn(),
      get: jest.fn().mockResolvedValue({
        id: "123",
        exists: true,
        data: () => ({
          patientId: "p001",
          storagePath: "photos/p001/file.jpg",
        }),
      }),
      delete: jest.fn(),
    }),
  }));

  const mockFirestore = {
    collection: mockCollection,
    FieldValue: {
      serverTimestamp: jest.fn(() => new Date()),
    },
  };

  const mockAdmin = {
    firestore: mockFirestore,
    storage: {
      bucket: jest.fn(() => ({
        file: jest.fn(() => ({
          save: jest.fn(),
          getSignedUrl: jest.fn().mockResolvedValue(["https://fake.com/img.jpg"]),
          delete: jest.fn(),
        })),
      })),
    },
  };

  return {
    ...mockAdmin,
    default: mockAdmin,
    firestore: mockFirestore,
    storage: mockAdmin.storage,
  };
});

// Mock del middleware de autenticación
const mockVerifyToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  (req as any).user = {
    uid: "test-caregiver-123",
    role: "caregiver",
    linkedPatientIds: ["p001"],
  };
  next();
};

// Configura la app Express de prueba
const app = express();
app.use(express.json());
app.use("/api/photos", mockVerifyToken, photosRouter);

describe("📸 Photos API", () => {
  it("✅ GET /api/photos/patient/:id devuelve lista de fotos", async () => {
    const res = await request(app).get("/api/photos/patient/p001");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].patientId).toBe("p001");
  });

  it("✅ POST /api/photos crea un nuevo registro", async () => {
    const res = await request(app)
      .post("/api/photos")
      .send({ patientId: "p001", url: "https://fake.com/img.jpg" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  it("✅ DELETE /api/photos/:id elimina correctamente", async () => {
    const res = await request(app).delete("/api/photos/123");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
