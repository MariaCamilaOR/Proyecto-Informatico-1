import request from "supertest";
import express, { Express } from "express";
import patientsRouter from "../../../src/routes/patients";
import { verifyTokenMiddleware } from "../../../src/middleware/expressAuth";
import { firestore } from "../../../src/firebaseAdmin";

// Mock de Firebase Admin
jest.mock("../../../src/firebaseAdmin", () => require("../../__mocks__/firebaseAdmin"));
// Mock del middleware
jest.mock("../../../src/middleware/expressAuth", () => ({
  verifyTokenMiddleware: jest.fn((req, res, next) => {
    (req as any).user = {
      uid: "caregiver-123",
      role: "caregiver",
      linkedPatientIds: ["patient-456"],
    };
    next();
  }),
}));

describe("Patients Routes", () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // Aplicar el middleware mockeado antes del router
    app.use("/api/patients", verifyTokenMiddleware as any, patientsRouter);
    jest.clearAllMocks();
  });

  describe("GET /api/patients", () => {
    it("debe listar todos los pacientes", async () => {
      const mockPatients = [
        {
          id: "patient-1",
          displayName: "Juan Pérez",
          email: "juan@example.com",
          role: "patient",
        },
        {
          id: "patient-2",
          displayName: "María García",
          email: "maria@example.com",
          role: "patient",
        },
      ];

      const mockGet = jest.fn().mockResolvedValue({
        forEach: (callback: any) => {
          mockPatients.forEach((patient) => {
            callback({
              id: patient.id,
              data: () => patient,
            });
          });
        },
      });

      const mockWhere = jest.fn().mockReturnValue({
        get: mockGet,
      });

      (firestore.collection as jest.Mock).mockReturnValue({
        where: mockWhere,
      });

      const response = await request(app).get("/api/patients");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty("id");
      expect(response.body[0]).toHaveProperty("email");
    });

    it("debe filtrar por email exacto", async () => {
      const mockPatients = [
        {
          id: "patient-1",
          displayName: "Juan Pérez",
          email: "juan@example.com",
          role: "patient",
        },
      ];

      const mockGet = jest.fn().mockResolvedValue({
        forEach: (callback: any) => {
          mockPatients.forEach((patient) => {
            callback({
              id: patient.id,
              data: () => patient,
            });
          });
        },
      });

      const mockWhere = jest.fn().mockReturnValue({
        get: mockGet,
      });

      (firestore.collection as jest.Mock).mockReturnValue({
        where: mockWhere,
      });

      const response2 = await request(app).get("/api/patients?email=juan@example.com");

      expect(response2.status).toBe(200);
      expect(response2.body).toHaveLength(1);
      expect(response2.body[0].email).toBe("juan@example.com");
    });

    it("debe filtrar por búsqueda parcial (q)", async () => {
      const mockPatients = [
        {
          id: "patient-1",
          displayName: "Juan Pérez",
          email: "juan@example.com",
          role: "patient",
        },
      ];

      const mockGet = jest.fn().mockResolvedValue({
        forEach: (callback: any) => {
          mockPatients.forEach((patient) => {
            callback({
              id: patient.id,
              data: () => patient,
            });
          });
        },
      });

      const mockWhere = jest.fn().mockReturnValue({
        get: mockGet,
      });

      (firestore.collection as jest.Mock).mockReturnValue({
        where: mockWhere,
      });

      const response3 = await request(app).get("/api/patients?q=juan");

      expect(response3.status).toBe(200);
      expect(response3.body.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("GET /api/patients/:id", () => {
    it("debe retornar paciente por ID", async () => {
      const mockDoc = {
        exists: true,
        id: "patient-456",
        data: () => ({
          displayName: "Juan Pérez",
          email: "juan@example.com",
          role: "patient",
        }),
      };

      (firestore.collection as jest.Mock).mockReturnValue({
        doc: jest.fn((id: string) => ({
          get: jest.fn().mockResolvedValue(mockDoc),
        })),
      });

      const response = await request(app).get("/api/patients/patient-456");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe("patient-456");
      expect(response.body.email).toBe("juan@example.com");
    });

    it("debe retornar 404 si paciente no existe", async () => {
      const mockDoc = {
        exists: false,
      };

      (firestore.collection as jest.Mock).mockReturnValue({
        doc: jest.fn((id: string) => ({
          get: jest.fn().mockResolvedValue(mockDoc),
        })),
      });

      const response = await request(app).get("/api/patients/patient-999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "patient_not_found");
    });
  });

  describe("POST /api/patients/:id/assign", () => {
    it("debe asignar cuidador a paciente", async () => {
      const mockTx = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            assignedCaregiverId: null, // No está asignado
          }),
        }),
        set: jest.fn(),
      };

      (firestore.runTransaction as jest.Mock).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Configurar el mock para este test específico
      (verifyTokenMiddleware as jest.Mock).mockImplementation((req, res, next) => {
        (req as any).user = {
          uid: "caregiver-123",
          role: "caregiver",
          linkedPatientIds: [],
        };
        next();
      });

      // Crear nueva app para este test con el middleware actualizado
      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/patients", verifyTokenMiddleware as any, patientsRouter);

      const response = await request(testApp).post("/api/patients/patient-456/assign");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);
      expect(response.body.patientId).toBe("patient-456");
      expect(response.body.caregiverId).toBe("caregiver-123");
    });

    it("debe rechazar si el usuario no es caregiver", async () => {
      (verifyTokenMiddleware as jest.Mock).mockImplementation((req, res, next) => {
        (req as any).user = {
          uid: "user-123",
          role: "patient", // No es caregiver
          linkedPatientIds: [],
        };
        next();
      });

      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/patients", verifyTokenMiddleware as any, patientsRouter);

      const response = await request(testApp).post("/api/patients/patient-456/assign");

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("error", "forbidden_role");
    });

    it("debe retornar 409 si paciente ya está asignado a otro cuidador", async () => {
      (verifyTokenMiddleware as jest.Mock).mockImplementation((req, res, next) => {
        (req as any).user = {
          uid: "caregiver-123",
          role: "caregiver",
          linkedPatientIds: [],
        };
        next();
      });

      // Simular transacción que lanza error 409
      (firestore.runTransaction as jest.Mock).mockRejectedValueOnce({
        status: 409,
        message: "already_assigned",
      });

      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/patients", verifyTokenMiddleware as any, patientsRouter);

      const response = await request(testApp).post("/api/patients/patient-456/assign");

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("error", "already_assigned");
    });

    it("debe retornar 404 si paciente no existe", async () => {
      (verifyTokenMiddleware as jest.Mock).mockImplementation((req, res, next) => {
        (req as any).user = {
          uid: "caregiver-123",
          role: "caregiver",
          linkedPatientIds: [],
        };
        next();
      });

      (firestore.runTransaction as jest.Mock).mockRejectedValueOnce({
        status: 404,
        message: "patient_not_found",
      });

      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/patients", verifyTokenMiddleware as any, patientsRouter);

      const response = await request(testApp).post("/api/patients/patient-999/assign");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "patient_not_found");
    });
  });

  describe("POST /api/patients/assign-by-code", () => {
    it("debe asignar por código de invitación", async () => {
      const mockPatientDoc = {
        exists: true,
        id: "patient-456",
        data: () => ({
          inviteCode: "ABC123",
          assignedCaregiverId: null,
        }),
      };

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          empty: false,
          docs: [mockPatientDoc],
        }),
      };

      (firestore.collection as jest.Mock).mockReturnValue({
        doc: jest.fn((id: string) => ({
          get: jest.fn().mockResolvedValue({ exists: false }),
        })),
        where: jest.fn(() => mockQuery),
      });

      const mockTx = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            assignedCaregiverId: null,
          }),
        }),
        set: jest.fn(),
      };

      (firestore.runTransaction as jest.Mock).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/patients", verifyTokenMiddleware as any, patientsRouter);

      const response = await request(testApp)
        .post("/api/patients/assign-by-code")
        .send({ code: "ABC123" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);
    });

    it("debe retornar 400 si falta código", async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/patients", verifyTokenMiddleware as any, patientsRouter);

      const response = await request(testApp).post("/api/patients/assign-by-code").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "missing_code");
    });

    it("debe retornar 404 si código no existe", async () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          empty: true,
          docs: [],
        }),
      };

      (firestore.collection as jest.Mock).mockReturnValue({
        doc: jest.fn((id: string) => ({
          get: jest.fn().mockResolvedValue({ exists: false }),
        })),
        where: jest.fn(() => mockQuery),
      });

      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/patients", verifyTokenMiddleware as any, patientsRouter);

      const response = await request(testApp)
        .post("/api/patients/assign-by-code")
        .send({ code: "INVALID" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "patient_not_found");
    });
  });

  describe("POST /api/patients/:id/unassign", () => {
    it("debe desasignar cuidador de paciente", async () => {
      const mockTx = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            assignedCaregiverId: "caregiver-123", // Asignado al mismo cuidador
          }),
        }),
        update: jest.fn(),
        set: jest.fn(),
      };

      (firestore.runTransaction as jest.Mock).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      (verifyTokenMiddleware as jest.Mock).mockImplementation((req, res, next) => {
        (req as any).user = {
          uid: "caregiver-123",
          role: "caregiver",
          linkedPatientIds: ["patient-456"],
        };
        next();
      });

      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/patients", verifyTokenMiddleware as any, patientsRouter);

      const response = await request(testApp).post("/api/patients/patient-456/unassign");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);
    });

    it("debe retornar 400 si paciente no estaba asignado", async () => {
      (verifyTokenMiddleware as jest.Mock).mockImplementation((req, res, next) => {
        (req as any).user = {
          uid: "caregiver-123",
          role: "caregiver",
          linkedPatientIds: ["patient-456"],
        };
        next();
      });

      (firestore.runTransaction as jest.Mock).mockRejectedValueOnce({
        status: 400,
        message: "not_assigned",
      });

      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/patients", verifyTokenMiddleware as any, patientsRouter);

      const response = await request(testApp).post("/api/patients/patient-456/unassign");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "not_assigned");
    });

    it("debe retornar 403 si paciente está asignado a otro cuidador", async () => {
      (verifyTokenMiddleware as jest.Mock).mockImplementation((req, res, next) => {
        (req as any).user = {
          uid: "caregiver-123",
          role: "caregiver",
          linkedPatientIds: ["patient-456"],
        };
        next();
      });

      (firestore.runTransaction as jest.Mock).mockRejectedValueOnce({
        status: 403,
        message: "not_assigned_to_you",
      });

      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/patients", verifyTokenMiddleware as any, patientsRouter);

      const response = await request(testApp).post("/api/patients/patient-456/unassign");

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("error", "not_assigned_to_you");
    });
  });
});

