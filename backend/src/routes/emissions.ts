import { Router } from "express";

import { databasePool } from "../db/database.js";
import { GET_MONTHLY_EMISSIONS } from "../db/queries/emissions.js";

export const emissionsRouter = Router();

emissionsRouter.get("/monthly", async (_request, response) => {
  try {
    const result = await databasePool.query(GET_MONTHLY_EMISSIONS);

    const monthlyEmissions = result.rows.map((row) => ({
      month: row.month,
      scope1KgCo2e: Number(row.scope_1_kg_co2e),
      scope2KgCo2e: Number(row.scope_2_kg_co2e),
      totalKgCo2e: Number(row.total_kg_co2e),
    }));

    response.status(200).json({
      data: monthlyEmissions,
    });
  } catch (error) {
    console.error("Failed to calculate monthly emissions:", error);

    response.status(500).json({
      error: "Failed to calculate monthly emissions.",
    });
  }
});