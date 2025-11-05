import { Request, Response, NextFunction } from "express";
import { verifyTokenMiddleware, verifyTokenNoClaims } from "../../../src/middleware/expressAuth";
import { auth, firestore } from "../../../src/firebaseAdmin";

// Mock de Firebase Admin
jest.mock("../../../src/firebaseAdmin", () => require("../../__mocks__/firebaseAdmin"));

describe("expressAuth Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    process.env.SKIP_AUTH = "false";
    process.env.NODE_ENV = "test";
    jest.clearAllMocks();
  });

  describe("verifyTokenMiddleware", () => {
    it("debe rechazar solicitudes sin token", async () => {
      mockReq.headers = {};

      await verifyTokenMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "missing_token" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("debe rechazar token sin prefijo Bearer", async () => {
      mockReq.headers = { authorization: "invalid-token" };

      await verifyTokenMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "missing_token" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("debe permitir acceso con token válido y claims correctos", async () => {
      const mockDecoded = {
        uid: "user-123",
        role: "caregiver",
        linkedPatientIds: ["patient-456"],
      };

      (auth.verifyIdToken as jest.Mock).mockResolvedValue(mockDecoded);
      mockReq.headers = { authorization: "Bearer valid-token" };

      await verifyTokenMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(auth.verifyIdToken).toHaveBeenCalledWith("valid-token", true);
      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).user).toEqual({
        uid: "user-123",
        role: "caregiver",
        linkedPatientIds: ["patient-456"],
      });
    });

    it("debe rechazar token sin claims (role o linkedPatientIds) si no hay fallback en Firestore", async () => {
      const mockDecoded = {
        uid: "user-123",
        // Sin role ni linkedPatientIds
      };

      (auth.verifyIdToken as jest.Mock).mockResolvedValue(mockDecoded);
      // Mock Firestore para que no encuentre el documento
      (firestore.collection as jest.Mock).mockReturnValue({
        doc: jest.fn((id: string) => ({
          get: jest.fn().mockResolvedValue({
            exists: false,
          }),
        })),
      });
      mockReq.headers = { authorization: "Bearer valid-token" };

      await verifyTokenMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "claims_missing_role" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("debe usar fallback de Firestore si token no tiene claims", async () => {
      const mockDecoded = {
        uid: "user-123",
        // Sin role ni linkedPatientIds en el token
      };

      (auth.verifyIdToken as jest.Mock).mockResolvedValue(mockDecoded);
      // Mock Firestore para que encuentre el documento con claims
      (firestore.collection as jest.Mock).mockReturnValue({
        doc: jest.fn((id: string) => ({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              role: "caregiver",
              linkedPatientIds: ["patient-456"],
            }),
          }),
        })),
      });
      mockReq.headers = { authorization: "Bearer valid-token" };

      await verifyTokenMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).user).toEqual({
        uid: "user-123",
        role: "caregiver",
        linkedPatientIds: ["patient-456"],
      });
    });

    it("debe rechazar token inválido", async () => {
      (auth.verifyIdToken as jest.Mock).mockRejectedValue(new Error("Invalid token"));
      mockReq.headers = { authorization: "Bearer invalid-token" };

      await verifyTokenMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "invalid_token",
        message: "Invalid token",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("debe usar modo SKIP_AUTH en desarrollo", async () => {
      process.env.SKIP_AUTH = "true";
      process.env.DEMO_UID = "demo-user-123";
      process.env.DEMO_ROLE = "patient";
      process.env.DEMO_PATIENT_ID = "demo-patient-456";

      await verifyTokenMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).user).toEqual({
        uid: "demo-user-123",
        role: "patient",
        linkedPatientIds: ["demo-patient-456"],
      });
      expect(auth.verifyIdToken).not.toHaveBeenCalled();
    });

    it("debe ocultar detalles de error en producción", async () => {
      process.env.NODE_ENV = "production";
      (auth.verifyIdToken as jest.Mock).mockRejectedValue(new Error("Token expired"));
      mockReq.headers = { authorization: "Bearer expired-token" };

      await verifyTokenMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "invalid_token" });
      expect(mockRes.json).not.toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.anything() })
      );
    });
  });

  describe("verifyTokenNoClaims", () => {
    it("debe permitir acceso sin claims (para registro)", async () => {
      const mockDecoded = {
        uid: "user-123",
        // Sin claims necesarios
      };

      (auth.verifyIdToken as jest.Mock).mockResolvedValue(mockDecoded);
      mockReq.headers = { authorization: "Bearer valid-token" };

      await verifyTokenNoClaims(mockReq as Request, mockRes as Response, mockNext);

      expect(auth.verifyIdToken).toHaveBeenCalledWith("valid-token", true);
      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).user).toEqual({
        uid: "user-123",
      });
    });

    it("debe rechazar token inválido", async () => {
      (auth.verifyIdToken as jest.Mock).mockRejectedValue(new Error("Invalid token"));
      mockReq.headers = { authorization: "Bearer invalid-token" };

      await verifyTokenNoClaims(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "invalid_token",
        message: "Invalid token",
      });
    });

    it("debe usar modo SKIP_AUTH", async () => {
      process.env.SKIP_AUTH = "true";
      process.env.DEMO_UID = "demo-user-123";

      await verifyTokenNoClaims(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).user).toEqual({
        uid: "demo-user-123",
      });
    });
  });
});

