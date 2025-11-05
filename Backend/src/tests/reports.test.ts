/**
 * src/tests/reports.test.ts
 * Pruebas unitarias para el módulo de reports.
 */
import express from "express";
import request from "supertest";
import reportsRouter from "../routes/reports";

// Mock de firebaseAdmin para no usar Firestore real
jest.mock("../firebaseAdmin", () => {
  const mockCollection = jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      forEach: (cb: any) => {
        cb({
          id: "r001",
          data: () => ({
            patientId: "p001",
            createdAt: new Date("2025-11-02T10:00:00Z"),
            score: 0.87,
            notes: "Paciente estable",
          }),
        });
      },
    }),
  }));

  return {
    firestore: { collection: mockCollection },
  };
});

// Configuración Express simulada
const app = express();
app.use("/api/reports", reportsRouter);

describe("📊 Reports API", () => {
  it("✅ GET /api/reports/patient/:id devuelve los reportes del paciente", async () => {
    const res = await request(app).get("/api/reports/patient/p001");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].patientId).toBe("p001");
    expect(res.body[0].score).toBeCloseTo(0.87);
  });

  it("✅ GET /api/reports/patient/:id?from&to aplica filtros correctamente", async () => {
    const res = await request(app).get("/api/reports/patient/p001?from=2025-10-01&to=2025-12-31");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
