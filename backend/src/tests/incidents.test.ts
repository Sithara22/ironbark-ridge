import { describe, expect, it } from "vitest";
import request from "supertest";

import { app } from "../app.js";

describe("GET /api/incidents/summary", () => {
  it("returns incident totals and breakdowns", async () => {
    const response = await request(app)
      .get("/api/incidents/summary")
      .expect(200);

    expect(response.body.totalIncidents).toBe(42);

    expect(response.body.byMonth).toHaveLength(18);

    expect(response.body.byType).toEqual(
      expect.arrayContaining([
        {
          type: "VEH",
          count: 13,
        },
      ]),
    );

    expect(response.body.bySeverity).toEqual([
      {
        severity: 1,
        count: 25,
      },
      {
        severity: 2,
        count: 15,
      },
      {
        severity: 3,
        count: 2,
      },
    ]);
  });
});