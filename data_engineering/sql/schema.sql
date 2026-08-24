DROP TABLE IF EXISTS data_quality_issues;
DROP TABLE IF EXISTS emission_factors;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS electricity_readings;
DROP TABLE IF EXISTS fuel_deliveries;

CREATE TABLE fuel_deliveries (
    id BIGSERIAL PRIMARY KEY,
    invoice_no VARCHAR(50) NOT NULL,
    delivery_date DATE,
    fuel_type VARCHAR(50) NOT NULL,
    quantity NUMERIC(14, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    cost_aud NUMERIC(14, 2) NOT NULL,
    site_area VARCHAR(100) NOT NULL,
    source_row INTEGER NOT NULL,
    delivery_date_raw VARCHAR(50) NOT NULL,
    delivery_month VARCHAR(7) NOT NULL,
    date_precision VARCHAR(20) NOT NULL
);

CREATE TABLE electricity_readings (
    id BIGSERIAL PRIMARY KEY,
    meter_id VARCHAR(50) NOT NULL,
    meter_description VARCHAR(100) NOT NULL,
    period VARCHAR(7) NOT NULL,
    consumption NUMERIC(14, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    source_row INTEGER NOT NULL
);

CREATE TABLE incidents (
    id BIGSERIAL PRIMARY KEY,
    incident_id VARCHAR(50) NOT NULL,
    incident_date DATE NOT NULL,
    location VARCHAR(100) NOT NULL,
    type_code VARCHAR(20) NOT NULL,
    severity INTEGER,
    description TEXT NOT NULL,
    source_row INTEGER NOT NULL,
    severity_raw VARCHAR(50),
    incident_date_raw VARCHAR(50)
);

CREATE TABLE suppliers (
    id BIGSERIAL PRIMARY KEY,
    supplier_name VARCHAR(200) NOT NULL,
    abn VARCHAR(50),
    category VARCHAR(100) NOT NULL,
    fy_spend_aud NUMERIC(14, 2) NOT NULL,
    source_row INTEGER NOT NULL,
    abn_normalized VARCHAR(20),
    supplier_name_normalized VARCHAR(200)
);

CREATE TABLE emission_factors (
    id BIGSERIAL PRIMARY KEY,
    activity VARCHAR(200) NOT NULL,
    scope INTEGER NOT NULL,
    unit VARCHAR(20) NOT NULL,
    kg_co2e_per_unit NUMERIC(10, 4) NOT NULL,
    source VARCHAR(255) NOT NULL
);

CREATE TABLE data_quality_issues (
    id BIGSERIAL PRIMARY KEY,
    source_file VARCHAR(255) NOT NULL,
    source_row INTEGER,
    record_id VARCHAR(255),
    field VARCHAR(100),
    issue_code VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    original_value TEXT,
    action VARCHAR(100),
    message TEXT NOT NULL
);