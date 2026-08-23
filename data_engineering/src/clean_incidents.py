import pandas as pd

from utils import (RAW_DATA_DIRECTORY, create_quality_issue, normalize_column_names)


SOURCE_FILE = "incident_register.csv"
DUPLICATE_CONTENT_THRESHOLD_DAYS = 30

SEVERITY_MAPPING = {
    "low": 1,
    "medium": 2,
    "1": 1,
    "2": 2,
    "3": 3,
}


def add_duplicate_id_issues(dataframe: pd.DataFrame, quality_issues: list[dict]) -> None:
    duplicate_id_mask = dataframe.duplicated(subset=["incident_id"], keep=False)

    for _, record in dataframe[duplicate_id_mask].iterrows():
        quality_issues.append(
            create_quality_issue(
                source_file=SOURCE_FILE,
                source_row=int(record["source_row"]),
                record_id=str(record["incident_id"]),
                field="incident_id",
                issue_code="DUPLICATE_INCIDENT_ID",
                severity="error",
                original_value=record["incident_id"],
                action="retained_with_surrogate_key",
                message=(
                    "Duplicate source incident ID retained as a separate "
                    "record using an internal database identifier."
                ),
            )
        )


def add_repeated_description_issues(dataframe: pd.DataFrame, quality_issues: list[dict]) -> None:
    repeated_description_mask = dataframe.duplicated(subset=["description"],keep=False)

    repeated_records = dataframe[repeated_description_mask].copy()

    if repeated_records.empty:
        return

    for description, group in repeated_records.groupby("description"):
        if len(group) < 2:
            continue

        group = group.sort_values("incident_date_parsed")

        incident_dates = group["incident_date_parsed"].dropna()

        if incident_dates.empty:
            continue

        first_date = incident_dates.min()
        last_date = incident_dates.max()
        date_span_days = (last_date - first_date).days

        incident_ids = sorted(
            group["incident_id"]
            .astype(str)
            .unique()
            .tolist()
        )

        if date_span_days <= DUPLICATE_CONTENT_THRESHOLD_DAYS:
            issue_code = "POSSIBLE_DUPLICATE_CONTENT"
            severity = "warning"
            action = "flagged"
            message = (
                "Identical incident descriptions occur within "
                f"{date_span_days} days. Related incident IDs: "
                f"{', '.join(incident_ids)}."
            )
        else:
            issue_code = "RECURRING_INCIDENT_TYPE"
            severity = "info"
            action = "retained"
            message = (
                "Identical incident description recurs across "
                f"{date_span_days} days in {len(group)} records. "
                f"Related incident IDs: {', '.join(incident_ids)}."
            )

        for _, record in group.iterrows():
            quality_issues.append(
                create_quality_issue(
                    source_file=SOURCE_FILE,
                    source_row=int(record["source_row"]),
                    record_id=str(record["incident_id"]),
                    field="description",
                    issue_code=issue_code,
                    severity=severity,
                    original_value=description,
                    action=action,
                    message=message,
                )
            )


def normalize_severity(dataframe: pd.DataFrame, quality_issues: list[dict]) -> pd.DataFrame:
    dataframe = dataframe.copy()

    dataframe["severity_raw"] = dataframe["severity"].astype(str)

    dataframe["severity"] = (
        dataframe["severity_raw"]
        .str.strip()
        .str.lower()
        .map(SEVERITY_MAPPING)
    )

    invalid_severity_records = dataframe[dataframe["severity"].isna()]

    for _, record in invalid_severity_records.iterrows():
        quality_issues.append(
            create_quality_issue(
                source_file=SOURCE_FILE,
                source_row=int(record["source_row"]),
                record_id=str(record["incident_id"]),
                field="severity",
                issue_code="INVALID_SEVERITY",
                severity="error",
                original_value=record["severity_raw"],
                action="flagged",
                message="Severity value could not be normalized.",
            )
        )

    return dataframe


def normalize_incident_dates(dataframe: pd.DataFrame, quality_issues: list[dict]) -> pd.DataFrame:
    dataframe = dataframe.copy()

    dataframe["incident_date_raw"] = dataframe["incident_date"]

    dataframe["incident_date_parsed"] = pd.to_datetime(
        dataframe["incident_date_raw"],
        format="%d/%m/%Y",
        errors="coerce",
    )

    invalid_date_records = dataframe[
        dataframe["incident_date_parsed"].isna()
    ]

    for _, record in invalid_date_records.iterrows():
        quality_issues.append(
            create_quality_issue(
                source_file=SOURCE_FILE,
                source_row=int(record["source_row"]),
                record_id=str(record["incident_id"]),
                field="incident_date",
                issue_code="INVALID_DATE",
                severity="error",
                original_value=record["incident_date_raw"],
                action="flagged",
                message="Incident date could not be parsed.",
            )
        )

    dataframe["incident_date"] = (dataframe["incident_date_parsed"].dt.strftime("%Y-%m-%d"))

    return dataframe


def clean_incidents() -> tuple[pd.DataFrame, list[dict]]:
    file_path = RAW_DATA_DIRECTORY / SOURCE_FILE

    dataframe = pd.read_csv(file_path, dtype={"severity": str})

    dataframe["source_row"] = dataframe.index + 2

    dataframe = normalize_column_names(dataframe)

    quality_issues = []

    dataframe = normalize_incident_dates(dataframe, quality_issues)

    add_duplicate_id_issues(dataframe, quality_issues)

    add_repeated_description_issues(dataframe, quality_issues)

    dataframe = normalize_severity(dataframe, quality_issues)

    dataframe = dataframe.drop(columns=["incident_date_parsed"])

    return dataframe, quality_issues