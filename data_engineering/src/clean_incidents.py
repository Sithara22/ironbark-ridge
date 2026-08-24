import pandas as pd

from utils import (RAW_DATA_DIRECTORY, create_quality_issue, normalize_column_names)


SOURCE_FILE = "incident_register.csv"

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


def add_possible_duplicate_content_issues(dataframe: pd.DataFrame, quality_issues: list[dict]) -> None:
    duplicate_columns = [
        "incident_date",
        "location",
        "type_code",
        "description",
    ]

    duplicate_content_mask = dataframe.duplicated(subset=duplicate_columns, keep=False)

    duplicate_records = dataframe[duplicate_content_mask]

    for _, record in duplicate_records.iterrows():
        matching_records = duplicate_records[
            (duplicate_records["incident_date"] == record["incident_date"])
            & (duplicate_records["location"] == record["location"])
            & (duplicate_records["type_code"] == record["type_code"])
            & (duplicate_records["description"] == record["description"])
            & (duplicate_records["incident_id"] != record["incident_id"])
        ]

        if matching_records.empty:
            continue

        related_incident_ids = (
            matching_records["incident_id"]
            .astype(str)
            .drop_duplicates()
            .tolist()
        )

        quality_issues.append(
            create_quality_issue(
                source_file=SOURCE_FILE,
                source_row=int(record["source_row"]),
                record_id=str(record["incident_id"]),
                field="description",
                issue_code="POSSIBLE_DUPLICATE_CONTENT",
                severity="warning",
                original_value=record["description"],
                action="flagged",
                message=(
                    "Another incident has the same date, location, type, "
                    "and description. Related incident IDs: "
                    f"{', '.join(related_incident_ids)}."
                ),
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

    parsed_dates = pd.to_datetime(
        dataframe["incident_date_raw"],
        format="%d/%m/%Y",
        errors="coerce",
    )

    invalid_date_mask = parsed_dates.isna()

    for index in dataframe[invalid_date_mask].index:
        record = dataframe.loc[index]

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

    dataframe["incident_date"] = parsed_dates.dt.strftime("%Y-%m-%d")

    return dataframe


def clean_incidents() -> tuple[pd.DataFrame, list[dict]]:
    file_path = RAW_DATA_DIRECTORY / SOURCE_FILE

    dataframe = pd.read_csv(file_path, dtype={"severity": str})

    dataframe["source_row"] = dataframe.index + 2
    dataframe = normalize_column_names(dataframe)

    quality_issues = []

    dataframe = normalize_incident_dates(dataframe, quality_issues)

    add_duplicate_id_issues(dataframe, quality_issues)

    add_possible_duplicate_content_issues(dataframe, quality_issues)

    dataframe = normalize_severity(dataframe, quality_issues)

    return dataframe, quality_issues