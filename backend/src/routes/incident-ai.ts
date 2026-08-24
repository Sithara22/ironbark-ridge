import { Router } from "express";

import { databasePool } from "../db/database.js";
import { GET_INCIDENT_AI_ANALYSIS } from "../db/queries/incident-ai-results.js";

export const incidentAiRouter = Router();

incidentAiRouter.get("/", async (_request, response) => {
  try {
    const result = await databasePool.query(
      GET_INCIDENT_AI_ANALYSIS,
    );

    const analyses = result.rows.map((row) => ({
      incidentRecordId: row.incident_record_id,
      incidentId: row.incident_id,
      incidentDate: row.incident_date,
      location: row.location,
      recordedSeverity: row.recorded_severity,
      description: row.description,
      sourceRow: row.source_row,
      category: row.category,
      psychosocialHazard: row.psychosocial_hazard,
      severityAssessment: row.severity_assessment,
      reason: row.reason,
      model: row.model,
      createdAt: row.created_at,
    }));

    response.status(200).json({
      totalAnalysed: analyses.length,
      analyses,
    });
  } catch (error) {
    console.error(
      "Failed to retrieve AI incident analysis:",
      error,
    );

    response.status(500).json({
      error: "Failed to retrieve AI incident analysis.",
    });
  }
});