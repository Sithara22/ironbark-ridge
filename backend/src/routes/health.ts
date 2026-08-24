import { Router } from "express";

import { databasePool } from "../db/database.js";

export const healthRouter = Router();

healthRouter.get("/", async (_request, response) => {
  try {
    await databasePool.query("SELECT 1");

    response.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    response.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});