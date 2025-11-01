import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import photosRouter from "./routes/photos";
import reportsRouter from "./routes/reports";
import { verifyTokenMiddleware } from "./middleware/expressAuth";

dotenv.config();

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Public health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Protected routes (verify token)
app.use("/api/photos", verifyTokenMiddleware, photosRouter);
app.use("/api/reports", verifyTokenMiddleware, reportsRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});

export default app;
