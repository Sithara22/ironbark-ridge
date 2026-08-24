import express from "express";

import { emissionsRouter } from "./routes/emissions.js";
import { healthRouter } from "./routes/health.js";
import { incidentsRouter } from "./routes/incidents.js";

export const app = express();

app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/emissions", emissionsRouter);
app.use("/api/incidents", incidentsRouter);