export const GET_INCIDENTS_FOR_AI_ANALYSIS = `
  SELECT
    incidents.id,
    incidents.incident_id,
    incidents.description,
    incidents.severity
  FROM incidents
  LEFT JOIN incident_ai_analysis
    ON incident_ai_analysis.incident_record_id = incidents.id
  WHERE incident_ai_analysis.id IS NULL
  ORDER BY incidents.id
`;

export const INSERT_INCIDENT_AI_ANALYSIS = `
  INSERT INTO incident_ai_analysis (
    incident_record_id,
    incident_id,
    category,
    psychosocial_hazard,
    severity_assessment,
    reason,
    model
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  ON CONFLICT (incident_record_id) DO NOTHING;
`;