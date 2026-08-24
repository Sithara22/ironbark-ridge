# Ironbark Ridge Compliance Intelligence Dashboard

A full-stack compliance intelligence prototype that transforms operational ESG and safety data into an interactive dashboard.

The application combines data engineering, PostgreSQL, REST APIs, AI-assisted incident analysis, and a React dashboard to provide insights into environmental emissions, safety incidents, data quality, and incident records that may require further review.

## Overview

Ironbark Ridge Compliance Intelligence was developed as an end-to-end
prototype for analysing operational compliance data.

The dashboard focuses on four areas:

-   Environmental emissions
-   Safety incidents
-   Data quality
-   AI-assisted incident review

The goal is to transform supplied operational data into useful
compliance intelligence while preserving traceability to the underlying
records.

## Key Features

### Environmental Emissions

-   Total Scope 1 emissions
-   Total Scope 2 emissions
-   Monthly emissions by scope
-   Scope 1 fuel-combustion emissions
-   Scope 2 purchased-electricity emissions
-   Interactive chart visualisation

### Incident Analytics

-   Total recorded incidents
-   Incidents by month
-   Incidents by type
-   Incidents by severity
-   Severity distribution visualisation

### Data Quality Reporting

The pipeline surfaces data-quality findings such as:

-   Month-only dates
-   Duplicate records
-   Duplicate incident IDs
-   Missing ABNs
-   Possible duplicate suppliers
-   Supplier-name inconsistencies
-   Invalid ABN formats
-   Negative quantities

### AI-Assisted Incident Analysis

The AI layer reviews incident descriptions to:

-   Classify incidents
-   Identify potential psychosocial hazards
-   Compare incident descriptions with recorded severity
-   Highlight potential severity mismatches
-   Provide a short explanation for each assessment

AI results are review signals and are not intended to replace human
compliance or safety decisions.

## Architecture

``` text
Source data
    |
    v
Data engineering / validation
    |
    v
PostgreSQL
    |
    +----------------------+
    |                      |
    v                      v
Operational data       AI incident analysis
    |                      |
    |                      v
    |               incident_ai_analysis
    |                      |
    +----------+-----------+
               |
               v
        Node.js / Express API
               |
               v
        React + TypeScript
               |
               v
     Compliance Dashboard
```

This architecture separates data processing, persistence, API logic, AI
analysis, and presentation.

## AI Analysis Flow

``` text
Incident record
      |
      v
Incident description
      |
      v
AI analysis
      |
      +--> Incident category
      |
      +--> Psychosocial hazard assessment
      |
      +--> Severity assessment
      |
      +--> Explanation
      |
      v
incident_ai_analysis
      |
      v
REST API
      |
      v
Dashboard AI layer
```

AI results are stored separately from the original incident records.
This preserves the source data and makes the AI output an additional
analytical layer rather than modifying the original records.

## Technology Stack

### Frontend

-   React
-   TypeScript
-   Vite
-   Axios
-   ESLint
-   Recharts
-   Lucide React

### Backend

-   Node.js
-   TypeScript
-   Express
-   PostgreSQL
-   OpenAI API

### Data Engineering

-   Python
-   pandas

### Testing

-   Vitest
-   Supertest
-   Backend API/integration tests

## Project Structure

``` text
ironbark-ridge/
├── backend/
│   ├── src/
│   │   ├── ai/
│   │   ├── db/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── tests/
│   │   ├── app.ts
│   │   └── ...
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── types/
│   │   └── ...
│   └── package.json
│
├── data_engineering/
│   └── ...
│
├── .env
├── .gitignore
└── README.md
```

## Backend API

### Monthly Emissions

``` http
GET /api/emissions/monthly
```

Returns monthly Scope 1 and Scope 2 emissions used by the emissions
visualisation.

### Incident Summary

``` http
GET /api/incidents/summary
```

Returns aggregated incident information, including incidents by month,
type, and severity.

### Data Quality

``` http
GET /api/data-quality
```

Returns structured data-quality findings displayed in the dashboard.

### AI Incident Analysis

``` http
GET /api/incidents/ai-analysis
```

Returns persisted AI-assisted incident assessments together with the
relevant source incident information.

## AI Severity Assessment

The AI analysis compares the description of an incident with its recorded severity.

The stored assessment uses three outcomes:

``` text
appropriate
too_low
too_high
```

These values indicate whether the recorded severity appears consistent with the incident description or may require human review.

For example, an incident describing a fracture requiring surgery may be highlighted when its recorded severity appears too low.

These assessments are review signals, not automated final decisions.

## Psychosocial Hazard Detection

Incident descriptions are also reviewed for potential psychosocial risk indicators.

Examples may include:

-   Workplace bullying or verbal abuse
-   Sustained workload pressure
-   Workplace exclusion
-   Fatigue or operational pressure
-   Requests for confidential or psychological support

Flagged records are displayed alongside the original incident information so that the AI result remains contextualised.

## Source Traceability

AI findings remain connected to their original incident records.

The dashboard therefore presents:

``` text
Original incident data
        +
AI-generated assessment
```

rather than presenting AI output without its source context.

## Data Quality

The source data is profiled and validated before being presented through the dashboard.

Detected quality issues are surfaced explicitly instead of being silently hidden or corrected. This is important because the reliability of compliance analytics depends on the quality of the underlying data.

## Environment Variables

Environment-specific configuration is stored in the root-level `.env`
file.

Example:

``` env
OPENAI_API_KEY=your_api_key
```

The `.env` file must not be committed to Git.

Example `.gitignore`:

``` gitignore
node_modules/
dist/
.env

__pycache__/
*.py[cod]

.DS_Store
```

Never commit real API keys or credentials to the repository.

## Running the Application

### 1. PostgreSQL

Ensure PostgreSQL is installed and running.

The development database is:

``` text
ironbark_ridge
```

Apply the required database setup scripts before starting the backend.

### 2. Data Engineering

Run the required data-engineering scripts to process and load the
supplied source data.

### 3. Backend

From the backend directory:

``` bash
cd backend
npm install
npm run build
npm run dev
```

The backend provides the REST APIs consumed by the frontend.

### 4. AI Incident Analysis

Configure `OPENAI_API_KEY` in the root `.env` file.

Then, from the backend directory:

``` bash
npm run analyse-incidents
```

The AI analysis results are persisted in PostgreSQL and subsequently
returned through the AI-analysis API.

### 5. Frontend

Open another terminal:

``` bash
cd frontend
npm install
npm run dev
```

By default, Vite serves the development UI at:

``` text
http://localhost:5173
```

## Testing

Run the backend tests from the backend directory:

``` bash
npm test
```

The current backend test suite contains:

-   5 test files
-   7 tests

The tests cover:

-   API health
-   Incident endpoints
-   Emissions
-   Data quality
-   AI incident analysis

A successful test run should report all five test files and all seven
tests as passing.

Validate the backend TypeScript build with:

``` bash
npm run build
```

## Frontend Production Build

Validate the frontend production build with:

``` bash
cd frontend
npm run build
```

This verifies that the React and TypeScript application compiles
successfully for production.

## Dashboard Design

The dashboard uses a dark visual theme with restrained semantic colour.

The visual system uses:

-   Green for Scope 1 and selected operational emphasis
-   Purple for Scope 2 and AI-related emphasis
-   Neutral dark surfaces for general information
-   A softer warm accent for warnings
-   Red for errors and high-severity states

Colour is used primarily to communicate meaning rather than as
decoration.

## Design Decisions

### Keep AI Results Separate from Source Records

AI-generated analysis is stored in the separate `incident_ai_analysis`
table rather than modifying the original incident records.

This preserves a clear distinction between recorded information and AI
interpretation.

### Persist AI Analysis

Incident descriptions do not need to be sent to the AI model every time
the dashboard loads.

Instead:

``` text
Incident
   -> AI analysis
   -> PostgreSQL
   -> REST API
   -> Dashboard
```

This reduces unnecessary API calls and keeps dashboard behaviour
predictable.

### Use AI as a Review Layer

The system does not automatically overwrite incident severity or make final safety decisions.

Instead, it identifies records that may deserve attention and explains why they were flagged.

### Keep the Frontend API-Driven

Dashboard metrics and findings are retrieved from backend APIs rather than being hard-coded into the React interface.

This keeps presentation concerns separate from the underlying data and business logic.

## Validation Performed

The implementation has been checked through:

-   TypeScript backend compilation
-   Backend API/integration tests
-   PostgreSQL queries
-   API response inspection
-   AI-analysis persistence checks
-   Frontend API integration
-   Dashboard visual inspection

The AI analysis was run across 42 incident records and stored in the
database.

## Current Prototype Scope

The prototype demonstrates an end-to-end compliance intelligence
workflow:

``` text
Data ingestion
      |
      v
Data quality
      |
      v
PostgreSQL
      |
      v
REST APIs
      |
      v
AI enrichment
      |
      v
Analytics
      |
      v
Interactive dashboard
```

The project focuses on demonstrating architecture, data transformations,
compliance insights, and responsible AI integration rather than
implementing a complete production compliance platform.

## Limitations

-   AI assessments require human review.
-   AI output depends on the quality and detail of incident
    descriptions.
-   The prototype focuses on the supplied Ironbark Ridge dataset.
-   Authentication and user management are outside the current prototype
    scope.
-   Production deployment, monitoring, and enterprise security controls
    would require additional implementation.
-   Additional frontend and end-to-end automated testing could be added.

## Future Improvements

-   Filter incidents by date, location, type, or severity
-   Add drill-down views for individual incidents
-   Add configurable compliance thresholds
-   Add trend and anomaly detection
-   Add exportable compliance reports
-   Add a human review/approval workflow for AI findings
-   Add further AI evaluation and confidence controls
-   Add role-based access control
-   Automate data-ingestion pipelines
-   Add production deployment and monitoring

## Summary

Ironbark Ridge Compliance Intelligence demonstrates how traditional data
engineering and software architecture can be combined with AI to create
a practical and traceable compliance-analysis workflow.

``` text
Source data
    -> validation
    -> PostgreSQL
    -> analytics
    -> AI-assisted review
    -> REST API
    -> dashboard
```

The result is a single interface for understanding environmental
emissions, safety incidents, data-quality issues, and AI-assisted
findings while preserving access to the underlying source information.
