import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import photosRouter from "./routes/photos";
import reportsRouter from "./routes/reports";
import usersRouter from "./routes/users";
import { verifyTokenMiddleware } from "./middleware/expressAuth";

// Load .env.local first, then fall back to .env if .env.local doesn't exist
dotenv.config({ path: "./.env.local" });
dotenv.config(); // This will load .env if .env.local didn't exist

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Public health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Protected routes (verify token)
app.use("/api/photos", verifyTokenMiddleware, photosRouter);
app.use("/api/reports", verifyTokenMiddleware, reportsRouter);
// Users route handles claim assignment for newly-registered users
app.use("/api/users", usersRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});

export default app;
