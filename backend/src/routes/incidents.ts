import { Router } from "express";

import { databasePool } from "../db/database.js";
import {
  GET_INCIDENTS_BY_MONTH,
  GET_INCIDENTS_BY_SEVERITY,
  GET_INCIDENTS_BY_TYPE,
  GET_TOTAL_INCIDENTS,
} from "../db/queries/incidents.js";

export const incidentsRouter = Router();

incidentsRouter.get("/summary", async (_request, response) => {
  try {
    const [
      totalResult,
      monthlyResult,
      typeResult,
      severityResult,
    ] = await Promise.all([
      databasePool.query(GET_TOTAL_INCIDENTS),
      databasePool.query(GET_INCIDENTS_BY_MONTH),
      databasePool.query(GET_INCIDENTS_BY_TYPE),
      databasePool.query(GET_INCIDENTS_BY_SEVERITY),
    ]);

    response.status(200).json({
      totalIncidents: totalResult.rows[0].total,
      byMonth: monthlyResult.rows,
      byType: typeResult.rows,
      bySeverity: severityResult.rows,
    });
  } catch (error) {
    console.error(
      "Failed to retrieve incident summary:",
      error,
    );

    response.status(500).json({
      error: "Failed to retrieve incident summary.",
    });
  }
});