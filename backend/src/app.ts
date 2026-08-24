import cors from "cors";
import express from "express";

import { dataQualityRouter } from "./routes/data-quality.js";
import { emissionsRouter } from "./routes/emissions.js";
import { healthRouter } from "./routes/health.js";
import { incidentAiRouter } from "./routes/incident-ai.js";
import { incidentsRouter } from "./routes/incidents.js";

export const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: allowedOrigins,
  }),
);

app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/emissions", emissionsRouter);
app.use("/api/incidents", incidentsRouter);
app.use("/api/data-quality", dataQualityRouter);
app.use(
  "/api/incidents/ai-analysis",
  incidentAiRouter,
);