import {
  AlertTriangle,
  Brain,
  DatabaseZap,
  Fuel,
  Leaf,
  ShieldAlert,
  Lightbulb,
  TriangleAlert,
  Zap,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { apiClient } from "../api/client";
import ChartTooltip from "../components/ChartTooltip";
import MetricCard from "../components/MetricCard";

import type {
  DataQualityResponse,
  EmissionsResponse,
  IncidentAiAnalysis,
  IncidentAiResponse,
  IncidentSummaryResponse,
} from "../types/dashboard";

const INCIDENT_TYPE_LABELS: Record<string, string> = {
  VEH: "Vehicle",
  EQP: "Equipment",
  ENV: "Environmental",
  DUS: "Dust",
  OTH: "Other",
  SLP: "Slip / Trip",
  ELE: "Electrical",
};

const SEVERITY_LABELS: Record<number, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
};

const SEVERITY_COLORS: Record<number, string> = {
  1: "#22C7A9",
  2: "#8676F3",
  3: "#EF6572",
};

const CHART_TEXT_MUTED = "#8497A8";
const CHART_TEXT_SECONDARY = "#C2CFDA";

const CHART_GRID =
  "rgba(132, 151, 168, 0.13)";

function formatTonnes(
  valueInKg: number,
): string {
  return new Intl.NumberFormat("en-AU", {
    maximumFractionDigits: 0,
  }).format(valueInKg / 1000);
}

function formatMonth(
  month: string,
): string {
  const [year, monthNumber] =
    month.split("-");

  return new Date(
    Number(year),
    Number(monthNumber) - 1,
  ).toLocaleDateString("en-AU", {
    month: "short",
    year: "2-digit",
  });
}

function formatIssueName(
  issueCode: string,
): string {
  const labels: Record<string, string> = {
    MONTH_ONLY_DATE:
      "Month-only dates",
    DUPLICATE_RECORD:
      "Duplicate records",
    DUPLICATE_INCIDENT_ID:
      "Duplicate incident IDs",
    MISSING_ABN:
      "Missing ABNs",
    POSSIBLE_DUPLICATE_SUPPLIER:
      "Possible duplicate suppliers",
    SUPPLIER_NAME_INCONSISTENCY:
      "Supplier name inconsistencies",
    INVALID_ABN_FORMAT:
      "Invalid ABN format",
    NEGATIVE_QUANTITY:
      "Negative quantity",
  };

  return (
    labels[issueCode] ??
    issueCode
      .toLowerCase()
      .replaceAll("_", " ")
  );
}

function Dashboard() {
  const [emissions, setEmissions] =
    useState<EmissionsResponse | null>(
      null,
    );

  const [incidents, setIncidents] =
    useState<IncidentSummaryResponse | null>(
      null,
    );

  const [dataQuality, setDataQuality] =
    useState<DataQualityResponse | null>(
      null,
    );

  const [aiAnalysis, setAiAnalysis] =
    useState<IncidentAiResponse | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          emissionsResponse,
          incidentsResponse,
          dataQualityResponse,
          aiResponse,
        ] = await Promise.all([
          apiClient.get<EmissionsResponse>(
            "/emissions/monthly",
          ),
          apiClient.get<IncidentSummaryResponse>(
            "/incidents/summary",
          ),
          apiClient.get<DataQualityResponse>(
            "/data-quality",
          ),
          apiClient.get<IncidentAiResponse>(
            "/incidents/ai-analysis",
          ),
        ]);

        setEmissions(
          emissionsResponse.data,
        );

        setIncidents(
          incidentsResponse.data,
        );

        setDataQuality(
          dataQualityResponse.data,
        );

        setAiAnalysis(
          aiResponse.data,
        );
      } catch (loadError) {
        console.error(
          "Failed to load dashboard:",
          loadError,
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load compliance intelligence data.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const totalScope1 = useMemo(
    () =>
      emissions?.data.reduce(
        (total, month) =>
          total +
          month.scope1KgCo2e,
        0,
      ) ?? 0,
    [emissions],
  );

  const totalScope2 = useMemo(
    () =>
      emissions?.data.reduce(
        (total, month) =>
          total +
          month.scope2KgCo2e,
        0,
      ) ?? 0,
    [emissions],
  );

  const psychosocialFindings =
    useMemo(
      () =>
        aiAnalysis?.analyses.filter(
          (analysis) =>
            analysis.psychosocialHazard,
        ) ?? [],
      [aiAnalysis],
    );

  const severityMismatches =
    useMemo(
      () =>
        aiAnalysis?.analyses.filter(
          (analysis) =>
            analysis.severityAssessment !==
            "appropriate",
        ) ?? [],
      [aiAnalysis],
    );

  const emissionsChartData =
    emissions?.data.map((month) => ({
      displayMonth:
        formatMonth(month.month),

      scope1Tonnes:
        month.scope1KgCo2e / 1000,

      scope2Tonnes:
        month.scope2KgCo2e / 1000,
    })) ?? [];

  const incidentMonthData =
    incidents?.byMonth.map(
      (item) => ({
        month: formatMonth(
          item.month,
        ),

        count: item.count,
      }),
    ) ?? [];

  const incidentTypeData =
    incidents?.byType.map(
      (item) => ({
        name:
          INCIDENT_TYPE_LABELS[
            item.type
          ] ?? item.type,

        count: item.count,
      }),
    ) ?? [];

  const severityData =
    incidents?.bySeverity.map(
      (item) => ({
        severity:
          item.severity,

        name:
          SEVERITY_LABELS[
            item.severity
          ] ??
          `Severity ${item.severity}`,

        count:
          item.count,
      }),
    ) ?? [];

  const errors =
    dataQuality?.summary.bySeverity.find(
      (item) =>
        item.severity === "error",
    )?.count ?? 0;

  const warnings =
    dataQuality?.summary.bySeverity.find(
      (item) =>
        item.severity === "warning",
    )?.count ?? 0;

  const information =
    dataQuality?.summary.bySeverity.find(
      (item) =>
        item.severity === "info",
    )?.count ?? 0;

  if (isLoading) {
    return (
      <div className="state-screen">
        <div className="state-screen__indicator" />

        <p>
          Loading compliance intelligence...
        </p>
      </div>
    );
  }

  if (
    error ||
    !emissions ||
    !incidents ||
    !dataQuality ||
    !aiAnalysis
  ) {
    return (
      <div className="state-screen">
        <AlertTriangle
          size={32}
        />

        <h2>
          Dashboard unavailable
        </h2>

        <p>
          {error ??
            "Required dashboard data is unavailable."}
        </p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand__mark">
            <Leaf size={25} />
          </div>

          <div>
            <strong>
              Ironbark Ridge
            </strong>

            <span>
              Compliance Intelligence
            </span>
          </div>
        </div>

        <span className="reporting-period">
          Jan 2025 – Jun 2026
        </span>
      </header>

      <main className="dashboard">
        <section className="hero">
          <h1>
            Compliance Intelligence
            Dashboard
          </h1>

          <p>
            Environmental emissions,
            incident analytics,
            data-quality reporting and
            AI-assisted safety insights.
          </p>
        </section>

        <section className="metric-grid">
          <MetricCard
            title="Scope 1 emissions"
            value={`${formatTonnes(
              totalScope1,
            )} t`}
            description="Fuel combustion CO₂e"
            icon={
              <Fuel size={21} />
            }
            variant="primary"
          />

          <MetricCard
            title="Scope 2 emissions"
            value={`${formatTonnes(
              totalScope2,
            )} t`}
            description="Purchased electricity CO₂e"
            icon={
              <Zap size={21} />
            }
            variant="energy"
          />

          <MetricCard
            title="Incidents"
            value={String(
              incidents.totalIncidents,
            )}
            description="Recorded incidents"
            icon={
              <ShieldAlert
                size={21}
              />
            }
          />

          <MetricCard
            title="Data quality findings"
            value={String(
              dataQuality.summary
                .totalIssues,
            )}
            description={`${errors} errors · ${warnings} warnings`}
            icon={
              <DatabaseZap
                size={21}
              />
            }
          />
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>
                Monthly emissions by scope
              </h2>

              <p>
                Scope 1 fuel combustion
                and Scope 2 purchased
                electricity emissions
                across the reporting
                period.
              </p>
            </div>
          </div>

          <article className="chart-card">
            <div className="chart-legend">
              <span>
                <i className="legend-dot legend-dot--primary" />
                Scope 1
              </span>

              <span>
                <i className="legend-dot legend-dot--energy" />
                Scope 2
              </span>
            </div>

            <div className="chart-container chart-container--emissions">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={
                    emissionsChartData
                  }
                  margin={{
                    top: 10,
                    right: 15,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="scope1Gradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#22C7A9"
                        stopOpacity={
                          0.24
                        }
                      />

                      <stop
                        offset="100%"
                        stopColor="#22C7A9"
                        stopOpacity={0}
                      />
                    </linearGradient>

                    <linearGradient
                      id="scope2Gradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#8676F3"
                        stopOpacity={
                          0.22
                        }
                      />

                      <stop
                        offset="100%"
                        stopColor="#8676F3"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke={
                      CHART_GRID
                    }
                    vertical={false}
                  />

                  <XAxis
                    dataKey="displayMonth"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill:
                        CHART_TEXT_MUTED,
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={60}
                    tick={{
                      fill:
                        CHART_TEXT_MUTED,
                      fontSize: 12,
                    }}
                    tickFormatter={(
                      value,
                    ) =>
                      `${Math.round(
                        Number(value),
                      )}t`
                    }
                  />

                  <Tooltip
                    content={
                      <ChartTooltip valueSuffix=" t CO₂e" />
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="scope1Tonnes"
                    stroke="#22C7A9"
                    strokeWidth={2.5}
                    fill="url(#scope1Gradient)"
                    name="Scope 1"
                  />

                  <Area
                    type="monotone"
                    dataKey="scope2Tonnes"
                    stroke="#8676F3"
                    strokeWidth={2.5}
                    fill="url(#scope2Gradient)"
                    name="Scope 2"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>
                Incidents
              </h2>

              <p>
                Monthly trend, incident
                type and recorded
                severity.
              </p>
            </div>
          </div>

          <article className="chart-card incident-month-card">
            <h3>
              Incidents by month
            </h3>

            <div className="chart-container chart-container--incident-month">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={
                    incidentMonthData
                  }
                  margin={{
                    top: 10,
                    right: 15,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    stroke={
                      CHART_GRID
                    }
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill:
                        CHART_TEXT_MUTED,
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    width={38}
                    tick={{
                      fill:
                        CHART_TEXT_MUTED,
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    content={
                      <ChartTooltip />
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Incidents"
                    stroke="#22C7A9"
                    strokeWidth={2.5}
                    dot={{
                      r: 3,
                      fill: "#22C7A9",
                      strokeWidth: 0,
                    }}
                    activeDot={{
                      r: 5,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <div className="incident-grid">
            <article className="chart-card">
              <h3>
                Incidents by type
              </h3>

              <div className="chart-container chart-container--bar">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    layout="vertical"
                    data={
                      incidentTypeData
                    }
                    margin={{
                      top: 5,
                      right: 15,
                      bottom: 5,
                      left: 10,
                    }}
                  >
                    <CartesianGrid
                      stroke={
                        CHART_GRID
                      }
                      horizontal={
                        false
                      }
                    />

                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={
                        false
                      }
                      tick={{
                        fill:
                          CHART_TEXT_MUTED,
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      width={105}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill:
                          CHART_TEXT_SECONDARY,
                        fontSize: 12,
                      }}
                    />

                    <Tooltip
                      cursor={{
                        fill:
                          "rgba(255, 255, 255, 0.025)",
                      }}
                      content={
                        <ChartTooltip />
                      }
                    />

                    <Bar
                      dataKey="count"
                      name="Incidents"
                      fill="#22C7A9"
                      radius={[
                        0,
                        7,
                        7,
                        0,
                      ]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="chart-card">
              <h3>
                Incidents by severity
              </h3>

              <div className="severity-layout">
                <div className="severity-chart">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>
                      <Pie
                        data={
                          severityData
                        }
                        dataKey="count"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={84}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {severityData.map(
                          (entry) => (
                            <Cell
                              key={
                                entry.severity
                              }
                              fill={
                                SEVERITY_COLORS[
                                  entry
                                    .severity
                                ]
                              }
                            />
                          ),
                        )}
                      </Pie>

                      <Tooltip
                        content={
                          <ChartTooltip />
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="severity-chart__center">
                    <strong>
                      {
                        incidents.totalIncidents
                      }
                    </strong>

                    <span>
                      Total
                    </span>
                  </div>
                </div>

                <div className="severity-list">
                  {severityData.map(
                    (item) => (
                      <div
                        key={
                          item.severity
                        }
                        className="severity-item"
                      >
                        <span>
                          <i
                            style={{
                              background:
                                SEVERITY_COLORS[
                                  item
                                    .severity
                                ],
                            }}
                          />

                          {item.name}
                        </span>

                        <strong>
                          {item.count}
                        </strong>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>
                Data quality report
              </h2>

              <p>
                Structured quality
                findings identified
                during ingestion and
                cleaning.
              </p>
            </div>
          </div>

          <article className="quality-card">
            <div className="quality-summary">
              <div className="quality-summary__total">
                <DatabaseZap
                  size={22}
                />

                <div>
                  <strong>
                    {
                      dataQuality.summary
                        .totalIssues
                    }
                  </strong>

                  <span>
                    Total findings
                  </span>
                </div>
              </div>

              <div className="quality-stat quality-stat--error">
                <strong>
                  {errors}
                </strong>

                <span>
                  Errors
                </span>
              </div>

              <div className="quality-stat quality-stat--warning">
                <strong>
                  {warnings}
                </strong>

                <span>
                  Warnings
                </span>
              </div>

              <div className="quality-stat quality-stat--info">
                <strong>
                  {information}
                </strong>

                <span>
                  Information
                </span>
              </div>
            </div>

            <div className="quality-issues">
              {dataQuality.summary.byIssueCode.map(
                (issue) => (
                  <div
                    key={
                      issue.issueCode
                    }
                    className="quality-issue"
                  >
                    <span>
                      {
                        issue.count
                      }
                    </span>

                    <strong>
                      {formatIssueName(
                        issue.issueCode,
                      )}
                    </strong>
                  </div>
                ),
              )}
            </div>
          </article>
        </section>

        <section className="dashboard-section ai-layer-section">
          <div className="section-heading">
            <div>
              <h2>
                AI layer
              </h2>

              <p>
                AI-assisted
                classification,
                psychosocial hazard
                detection and severity
                review.
              </p>
            </div>
          </div>

          <div className="ai-overview-grid">
            <article className="ai-summary-card">
              <div className="ai-summary-card__icon">
                <Brain
                  size={22}
                />
              </div>

              <div className="ai-summary-card__content">
                <strong>
                  Psychosocial hazards
                </strong>

                <span>
                  AI-identified incident
                  records
                </span>
              </div>

              <div className="ai-summary-card__value">
                {
                  psychosocialFindings.length
                }
              </div>
            </article>

            <article className="ai-summary-card ai-summary-card--energy">
              <div className="ai-summary-card__icon">
                <TriangleAlert
                  size={22}
                />
              </div>

              <div className="ai-summary-card__content">
                <strong>
                  Severity mismatches
                </strong>

                <span>
                  Records requiring
                  review
                </span>
              </div>

              <div className="ai-summary-card__value">
                {
                  severityMismatches.length
                }
              </div>
            </article>
          </div>

          <div className="findings-grid">
            <div className="findings-column">
              <div className="findings-column__heading">
                <div className="finding-icon finding-icon--psychosocial">
                  <Brain
                    size={18}
                  />
                </div>

                <div>
                  <strong>
                    Psychosocial hazard
                    findings
                  </strong>

                  <span>
                    {
                      psychosocialFindings.length
                    }{" "}
                    records
                  </span>
                </div>
              </div>

              {psychosocialFindings.map(
                (finding) => (
                  <FindingCard
                    key={
                      finding.incidentRecordId
                    }
                    finding={
                      finding
                    }
                    type="psychosocial"
                  />
                ),
              )}
            </div>

            <div className="findings-column">
              <div className="findings-column__heading">
                <div className="finding-icon finding-icon--severity">
                  <TriangleAlert
                    size={18}
                  />
                </div>

                <div>
                  <strong>
                    Severity review
                    findings
                  </strong>

                  <span>
                    {
                      severityMismatches.length
                    }{" "}
                    records
                  </span>
                </div>
              </div>

              {severityMismatches.map(
                (finding) => (
                  <FindingCard
                    key={
                      finding.incidentRecordId
                    }
                    finding={
                      finding
                    }
                    type="severity"
                  />
                ),
              )}
            </div>
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>
            Ironbark Ridge ·
            Compliance Intelligence
          </span>

          <span>
            Source data: Jan 2025 –
            Jun 2026
          </span>
        </footer>
      </main>
    </div>
  );
}

interface FindingCardProps {
  finding:
    IncidentAiAnalysis;

  type:
    | "psychosocial"
    | "severity";
}

function FindingCard({
  finding,
  type,
}: FindingCardProps) {
  const severityLabel =
    SEVERITY_LABELS[
      finding.recordedSeverity
    ] ??
    String(
      finding.recordedSeverity,
    );

  return (
    <article className="finding-card">
      <div className="finding-card__top">
        <div>
          <strong>
            {
              finding.incidentId
            }
          </strong>

          <span>
            {
              finding.incidentDate
            }{" "}
            ·{" "}
            {
              finding.location
            }
          </span>
        </div>

        <span
          className={
            type ===
            "psychosocial"
              ? "finding-badge finding-badge--psychosocial"
              : "finding-badge finding-badge--severity"
          }
        >
          {type ===
          "psychosocial"
            ? "Psychosocial"
            : finding.severityAssessment ===
                "too_low"
              ? "Severity too low"
              : "Severity too high"}
        </span>
      </div>

      <p className="finding-card__description">
        {
          finding.description
        }
      </p>

      <div className="finding-card__reason">
        <Lightbulb
          size={16}
        />

        <span>
          {finding.reason}
        </span>
      </div>

      <div className="finding-card__footer">
        <span>
          Recorded severity:{" "}
          <strong>
            {severityLabel}
          </strong>
        </span>

        <span>
          incident_register.csv ·
          Row{" "}
          {
            finding.sourceRow
          }
        </span>
      </div>
    </article>
  );
}

export default Dashboard;