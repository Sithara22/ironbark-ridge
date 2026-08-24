import { Router } from "express";

import { databasePool } from "../db/database.js";
import {
  GET_DATA_QUALITY_BY_ISSUE_CODE,
  GET_DATA_QUALITY_ISSUES,
  GET_DATA_QUALITY_SUMMARY,
  GET_TOTAL_DATA_QUALITY_ISSUES,
} from "../db/queries/data-quality.js";

export const dataQualityRouter = Router();

dataQualityRouter.get("/", async (_request, response) => {
  try {
    const [
      totalResult,
      severityResult,
      issueCodeResult,
      issuesResult,
    ] = await Promise.all([
      databasePool.query(GET_TOTAL_DATA_QUALITY_ISSUES),
      databasePool.query(GET_DATA_QUALITY_SUMMARY),
      databasePool.query(GET_DATA_QUALITY_BY_ISSUE_CODE),
      databasePool.query(GET_DATA_QUALITY_ISSUES),
    ]);

    const issues = issuesResult.rows.map((row) => ({
      id: row.id,
      sourceFile: row.source_file,
      sourceRow: row.source_row,
      recordId: row.record_id,
      field: row.field,
      issueCode: row.issue_code,
      severity: row.severity,
      originalValue: row.original_value,
      action: row.action,
      message: row.message,
    }));

    response.status(200).json({
      summary: {
        totalIssues: totalResult.rows[0].total,
        bySeverity: severityResult.rows,
        byIssueCode: issueCodeResult.rows.map((row) => ({
          issueCode: row.issue_code,
          count: row.count,
        })),
      },
      issues,
    });
  } catch (error) {
    console.error(
      "Failed to retrieve data quality report:",
      error,
    );

    response.status(500).json({
      error: "Failed to retrieve data quality report.",
    });
  }
});