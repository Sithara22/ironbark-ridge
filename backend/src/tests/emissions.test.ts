import { describe, expect, it } from "vitest";
import request from "supertest";

import { app } from "../app.js";

describe("GET /api/emissions/monthly", () => {
  it("returns monthly Scope 1 and Scope 2 emissions", async () => {
    const response = await request(app)
      .get("/api/emissions/monthly")
      .expect(200);

    expect(response.body.data).toHaveLength(18);

    expect(response.body.data[0]).toEqual({
      month: "2025-01",
      scope1KgCo2e: 1079589.03,
      scope2KgCo2e: 1457844.065,
      totalKgCo2e: 2537433.095,
    });
  });

  it("returns zero Scope 1 for November 2025 when no fuel deliveries exist", async () => {
    const response = await request(app)
      .get("/api/emissions/monthly")
      .expect(200);

    const november2025 = response.body.data.find(
      (row: { month: string }) => row.month === "2025-11",
    );

    expect(november2025).toBeDefined();
    expect(november2025.scope1KgCo2e).toBe(0);
  });
});