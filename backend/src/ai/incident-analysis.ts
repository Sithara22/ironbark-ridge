import { openaiClient } from "./client.js";
import { INCIDENT_ANALYSIS_SYSTEM_PROMPT } from "./prompts.js";

export interface IncidentInput {
  id: string;
  incidentId: string;
  description: string;
  severity: number;
}

export interface IncidentAnalysis {
  category: string;
  psychosocialHazard: boolean;
  severityAssessment:
    | "appropriate"
    | "too_low"
    | "too_high";
  reason: string;
}

export async function analyseIncident(
  incident: IncidentInput,
): Promise<IncidentAnalysis> {
  const response = await openaiClient.responses.create({
    model: "gpt-5.4-mini",
    input: [
      {
        role: "system",
        content: INCIDENT_ANALYSIS_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: JSON.stringify({
          incidentId: incident.incidentId,
          description: incident.description,
          recordedSeverity: incident.severity,
        }),
      },
    ],
  });

  return JSON.parse(response.output_text) as IncidentAnalysis;
}