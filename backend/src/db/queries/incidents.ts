export const GET_TOTAL_INCIDENTS = `
  SELECT COUNT(*)::int AS total
  FROM incidents;
`;

export const GET_INCIDENTS_BY_MONTH = `
  SELECT
    TO_CHAR(
      DATE_TRUNC('month', incident_date),
      'YYYY-MM'
    ) AS month,
    COUNT(*)::int AS count
  FROM incidents
  GROUP BY DATE_TRUNC('month', incident_date)
  ORDER BY DATE_TRUNC('month', incident_date);
`;

export const GET_INCIDENTS_BY_TYPE = `
  SELECT
    type_code AS type,
    COUNT(*)::int AS count
  FROM incidents
  GROUP BY type_code
  ORDER BY count DESC, type_code;
`;

export const GET_INCIDENTS_BY_SEVERITY = `
  SELECT
    severity,
    COUNT(*)::int AS count
  FROM incidents
  GROUP BY severity
  ORDER BY severity;
`;