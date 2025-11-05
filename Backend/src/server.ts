import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";

import photosRouter from "./routes/photos";
import reportsRouter from "./routes/reports";
import usersRouter from "./routes/users";
import descriptionsRouter from "./routes/descriptions";
import notificationsRouter from "./routes/notifications";
import patientsRouter from "./routes/patients";
import { verifyTokenMiddleware, verifyTokenNoClaims } from "./middleware/expressAuth";
import quizzesRouter from "./routes/quizzes";

// Carga .env.local desde Backend (funciona en dev/dist)
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config();

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));

// Público
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Protegidas
app.use("/api/photos",         verifyTokenMiddleware, photosRouter);
app.use("/api/reports",        verifyTokenMiddleware, reportsRouter);
app.use("/api/descriptions",   verifyTokenMiddleware, descriptionsRouter);
app.use("/api/notifications",  verifyTokenMiddleware, notificationsRouter);
app.use("/api/patients",       verifyTokenMiddleware, patientsRouter);
app.use("/api/quizzes",       verifyTokenMiddleware, quizzesRouter);

// Onboarding/claims: requiere token válido pero sin exigir custom claims
app.use("/api/users", verifyTokenNoClaims, usersRouter);

// 404 y errores
app.use((_req, res) => res.status(404).json({ error: "not_found" }));
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  const status = (err && (err.status || err.code)) || 500;
  res.status(status).json({
    error: "internal_error",
    message: process.env.NODE_ENV === "production" ? undefined : String(err?.message || err),
  });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Server listening on port ${port}`));

export default app;
