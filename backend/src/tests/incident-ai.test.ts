import { describe, expect, it } from "vitest";
import request from "supertest";

import { app } from "../app.js";

describe("GET /api/incidents/ai-analysis", () => {
  it("returns AI analysis for all incidents", async () => {
    const response = await request(app)
      .get("/api/incidents/ai-analysis")
      .expect(200);

    expect(response.body.totalAnalysed).toBe(42);
    expect(response.body.analyses).toHaveLength(42);
  });

  it("includes traceable psychosocial and severity findings", async () => {
    const response = await request(app)
      .get("/api/incidents/ai-analysis")
      .expect(200);

    const psychosocialFindings = response.body.analyses.filter(
      (analysis: { psychosocialHazard: boolean }) =>
        analysis.psychosocialHazard,
    );

    const severityMismatches = response.body.analyses.filter(
      (analysis: { severityAssessment: string }) =>
        analysis.severityAssessment !== "appropriate",
    );

    expect(psychosocialFindings).toHaveLength(4);
    expect(severityMismatches).toHaveLength(3);

    expect(severityMismatches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          incidentId: "INC-2025-118",
          severityAssessment: "too_low",
          sourceRow: 12,
        }),
        expect.objectContaining({
          incidentId: "INC-2025-141",
          severityAssessment: "too_low",
          sourceRow: 21,
        }),
      ]),
    );
  });
});