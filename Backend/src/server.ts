// src/server.ts
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
import quizzesRouter from "./routes/quizzes";
import consultorioRoutes from "./routes/consultorio";

import { verifyTokenMiddleware, verifyTokenNoClaims } from "./middleware/expressAuth";

// Carga variables: primero .env.local del Backend y luego .env
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config();

const app = express();

// ---- CORS ----
const FRONT_ORIGIN =
  process.env.FRONTEND_ORIGIN ||
  process.env.VITE_FRONTEND_ORIGIN ||
  process.env.CORS_ORIGIN ||
  "*"; // en dev, permitir todo si no está definido

app.use(
  cors({
    origin: FRONT_ORIGIN === "*" ? true : FRONT_ORIGIN.split(",").map(s => s.trim()),
    credentials: true,
  })
);

// Logs y parsers
app.use(morgan("dev"));
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true, limit: "4mb" }));

// Útil si vas detrás de proxy (Vercel/Render/NGINX)
app.set("trust proxy", true);

// Salud
app.get("/api/health", (_req, res) =>
  res.json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    skipAuth: process.env.SKIP_AUTH === "true",
  })
);

// Aviso de modo demo (con SKIP_AUTH)
if (process.env.SKIP_AUTH === "true") {
  // eslint-disable-next-line no-console
  console.log(
    "[server] SKIP_AUTH=true -> usando usuario demo para todas las rutas protegidas"
  );
}

// ---- Rutas protegidas (requieren token válido + claims) ----
app.use("/api/photos",        verifyTokenMiddleware, photosRouter);
app.use("/api/reports",       verifyTokenMiddleware, reportsRouter);
app.use("/api/descriptions",  verifyTokenMiddleware, descriptionsRouter);
app.use("/api/notifications", verifyTokenMiddleware, notificationsRouter);
app.use("/api/patients",      verifyTokenMiddleware, patientsRouter);
app.use("/api/quizzes",       verifyTokenMiddleware, quizzesRouter);

// (Si tu flujo del consultorio es privado, protégelo igual)
app.use("/api/consultorio",   verifyTokenMiddleware, consultorioRoutes);

// ---- Rutas con token válido, pero SIN exigir claims (onboarding/claims) ----
app.use("/api/users", verifyTokenNoClaims, usersRouter);

// 404
app.use((_req, res) => res.status(404).json({ error: "not_found" }));

// Handler de errores
app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    const status = (err && (err.status || err.code)) || 500;
    res.status(status).json({
      error: "internal_error",
      message:
        process.env.NODE_ENV === "production" ? undefined : String(err?.message || err),
    });
  }
);

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Server listening on port ${port}`));

export default app;
