import "../config/env.js";

import { analyseIncident } from "../ai/incident-analysis.js";
import { databasePool } from "../db/database.js";
import {
  GET_INCIDENTS_FOR_AI_ANALYSIS,
  INSERT_INCIDENT_AI_ANALYSIS,
} from "../db/queries/incident-ai.js";

const MODEL_NAME = "gpt-5.4-mini";

const VALID_SEVERITY_ASSESSMENTS = [
  "appropriate",
  "too_low",
  "too_high",
];

function isValidAnalysis(analysis: unknown): boolean {
  if (
    typeof analysis !== "object"
    || analysis === null
  ) {
    return false;
  }

  const result = analysis as Record<string, unknown>;

  return (
    typeof result.category === "string"
    && result.category.trim().length > 0
    && typeof result.psychosocialHazard === "boolean"
    && typeof result.severityAssessment === "string"
    && VALID_SEVERITY_ASSESSMENTS.includes(
      result.severityAssessment,
    )
    && typeof result.reason === "string"
    && result.reason.trim().length > 0
  );
}

async function analyseIncidents(): Promise<void> {
  const incidentResult = await databasePool.query(
    GET_INCIDENTS_FOR_AI_ANALYSIS,
  );

  if (incidentResult.rows.length === 0) {
    console.log("No incidents require AI analysis.");
    return;
  }

  console.log(
    `${incidentResult.rows.length} incidents require AI analysis.`,
  );

  for (const row of incidentResult.rows) {
    const incident = {
      id: row.id,
      incidentId: row.incident_id,
      description: row.description,
      severity: row.severity,
    };

    try {
      console.log(
        `Analysing incident: ${incident.incidentId}`,
      );

      const analysis = await analyseIncident(incident);

      if (!isValidAnalysis(analysis)) {
        console.error(
          `Invalid AI response for ${incident.incidentId}.`,
        );
        continue;
      }

      await databasePool.query(
        INSERT_INCIDENT_AI_ANALYSIS,
        [
          incident.id,
          incident.incidentId,
          analysis.category,
          analysis.psychosocialHazard,
          analysis.severityAssessment,
          analysis.reason,
          MODEL_NAME,
        ],
      );

      console.log(
        `Saved analysis for ${incident.incidentId}.`,
      );
    } catch (error) {
      console.error(
        `Failed to analyse ${incident.incidentId}:`,
        error,
      );
    }
  }
}

async function main(): Promise<void> {
  try {
    await analyseIncidents();
  } catch (error) {
    console.error(
      "Incident analysis process failed:",
      error,
    );

    process.exitCode = 1;
  } finally {
    await databasePool.end();
  }
}

main();