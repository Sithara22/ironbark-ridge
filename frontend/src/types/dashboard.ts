export interface MonthlyEmission {
  month: string;
  scope1KgCo2e: number;
  scope2KgCo2e: number;
  totalKgCo2e: number;
}

export interface EmissionsResponse {
  data: MonthlyEmission[];
}

export interface IncidentCount {
  count: number;
}

export interface MonthlyIncidentCount extends IncidentCount {
  month: string;
}

export interface IncidentTypeCount extends IncidentCount {
  type: string;
}

export interface IncidentSeverityCount extends IncidentCount {
  severity: number;
}

export interface IncidentSummaryResponse {
  totalIncidents: number;
  byMonth: MonthlyIncidentCount[];
  byType: IncidentTypeCount[];
  bySeverity: IncidentSeverityCount[];
}

export interface DataQualitySeverity {
  severity: string;
  count: number;
}

export interface DataQualityIssueCode {
  issueCode: string;
  count: number;
}

export interface DataQualityIssue {
  id: string;
  sourceFile: string;
  sourceRow: number;
  recordId: string;
  field: string;
  issueCode: string;
  severity: string;
  originalValue: string | null;
  action: string;
  message: string;
}

export interface DataQualityResponse {
  summary: {
    totalIssues: number;
    bySeverity: DataQualitySeverity[];
    byIssueCode: DataQualityIssueCode[];
  };
  issues: DataQualityIssue[];
}

export interface IncidentAiAnalysis {
  incidentRecordId: string;
  incidentId: string;
  incidentDate: string;
  location: string;
  recordedSeverity: number;
  description: string;
  sourceRow: number;
  category: string;
  psychosocialHazard: boolean;
  severityAssessment: "appropriate" | "too_low" | "too_high";
  reason: string;
  model: string;
  createdAt: string;
}

export interface IncidentAiResponse {
  totalAnalysed: number;
  analyses: IncidentAiAnalysis[];
}