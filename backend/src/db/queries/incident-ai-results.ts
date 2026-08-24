export const GET_INCIDENT_AI_ANALYSIS = `
  SELECT
    incidents.id AS incident_record_id,
    incidents.incident_id,
    TO_CHAR(incidents.incident_date, 'YYYY-MM-DD') AS incident_date,
    incidents.location,
    incidents.severity AS recorded_severity,
    incidents.description,
    incidents.source_row,
    incident_ai_analysis.category,
    incident_ai_analysis.psychosocial_hazard,
    incident_ai_analysis.severity_assessment,
    incident_ai_analysis.reason,
    incident_ai_analysis.model,
    incident_ai_analysis.created_at
  FROM incidents
  JOIN incident_ai_analysis
    ON incident_ai_analysis.incident_record_id = incidents.id
  ORDER BY incidents.incident_date, incidents.id;
`;