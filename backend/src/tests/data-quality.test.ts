import { describe, expect, it } from "vitest";
import request from "supertest";

import { app } from "../app.js";

describe("GET /api/data-quality", () => {
  it("returns the structured data quality report", async () => {
    const response = await request(app)
      .get("/api/data-quality")
      .expect(200);

    expect(response.body.summary.totalIssues).toBe(43);

    expect(response.body.summary.bySeverity).toEqual(
      expect.arrayContaining([
        {
          severity: "error",
          count: 2,
        },
        {
          severity: "warning",
          count: 15,
        },
        {
          severity: "info",
          count: 26,
        },
      ]),
    );

    expect(response.body.summary.byIssueCode).toEqual(
      expect.arrayContaining([
        {
          issueCode: "DUPLICATE_RECORD",
          count: 7,
        },
        {
          issueCode: "MONTH_ONLY_DATE",
          count: 26,
        },
      ]),
    );

    expect(response.body.issues).toHaveLength(43);
  });
});