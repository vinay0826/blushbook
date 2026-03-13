import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import shelfRoutes from "./routes/shelfRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { env } from "./config/env.js";

export function createApp() {
  const app = express();
  const allowedOrigins = env.corsOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins.includes("*") ? true : allowedOrigins
    })
  );
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "between-the-lines-backend" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/shelf", shelfRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
