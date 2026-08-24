CREATE TABLE IF NOT EXISTS incident_ai_analysis (
    id BIGSERIAL PRIMARY KEY,
    incident_record_id BIGINT NOT NULL UNIQUE REFERENCES incidents(id),
    incident_id VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    psychosocial_hazard BOOLEAN NOT NULL,
    severity_assessment VARCHAR(30) NOT NULL,
    reason TEXT NOT NULL,
    model VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);