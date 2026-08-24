export const GET_DATA_QUALITY_SUMMARY = `
  SELECT
    severity,
    COUNT(*)::int AS count
  FROM data_quality_issues
  GROUP BY severity
  ORDER BY severity;
`;

export const GET_DATA_QUALITY_BY_ISSUE_CODE = `
  SELECT
    issue_code AS issue_code,
    COUNT(*)::int AS count
  FROM data_quality_issues
  GROUP BY issue_code
  ORDER BY count DESC, issue_code;
`;

export const GET_DATA_QUALITY_ISSUES = `
  SELECT
    id,
    source_file,
    source_row,
    record_id,
    field,
    issue_code,
    severity,
    original_value,
    action,
    message
  FROM data_quality_issues
  ORDER BY
    CASE severity
      WHEN 'error' THEN 1
      WHEN 'warning' THEN 2
      WHEN 'info' THEN 3
      ELSE 4
    END,
    source_file,
    source_row;
`;

export const GET_TOTAL_DATA_QUALITY_ISSUES = `
  SELECT COUNT(*)::int AS total
  FROM data_quality_issues;
`;