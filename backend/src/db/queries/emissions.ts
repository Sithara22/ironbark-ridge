export const GET_MONTHLY_EMISSIONS = `
  WITH scope_1 AS (
    SELECT
      fuel.delivery_month AS month,
      SUM(
        fuel.quantity *
        CASE
          WHEN fuel.fuel_type = 'Diesel'
            THEN diesel_factor.kg_co2e_per_unit
          WHEN fuel.fuel_type = 'Petrol (ULP)'
            THEN petrol_factor.kg_co2e_per_unit
          ELSE 0
        END
      ) AS scope_1_kg_co2e
    FROM fuel_deliveries fuel
    CROSS JOIN (
      SELECT kg_co2e_per_unit
      FROM emission_factors
      WHERE activity = 'Diesel combustion (stationary & transport)'
    ) diesel_factor
    CROSS JOIN (
      SELECT kg_co2e_per_unit
      FROM emission_factors
      WHERE activity = 'Petrol (ULP) combustion'
    ) petrol_factor
    GROUP BY fuel.delivery_month
  ),
  scope_2 AS (
    SELECT
      electricity.period AS month,
      SUM(
        electricity.consumption *
        electricity_factor.kg_co2e_per_unit
      ) AS scope_2_kg_co2e
    FROM electricity_readings electricity
    CROSS JOIN (
      SELECT kg_co2e_per_unit
      FROM emission_factors
      WHERE activity = 'Grid electricity - Queensland'
    ) electricity_factor
    GROUP BY electricity.period
  )
  SELECT
    COALESCE(scope_1.month, scope_2.month) AS month,
    COALESCE(scope_1.scope_1_kg_co2e, 0) AS scope_1_kg_co2e,
    COALESCE(scope_2.scope_2_kg_co2e, 0) AS scope_2_kg_co2e,
    COALESCE(scope_1.scope_1_kg_co2e, 0)
      + COALESCE(scope_2.scope_2_kg_co2e, 0)
      AS total_kg_co2e
  FROM scope_1
  FULL OUTER JOIN scope_2
    ON scope_1.month = scope_2.month
  ORDER BY month;
`;