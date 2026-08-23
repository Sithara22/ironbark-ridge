from pathlib import Path
from typing import Any

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DATA_DIRECTORY = PROJECT_ROOT / "data" / "raw"
PROCESSED_DATA_DIRECTORY = PROJECT_ROOT / "data" / "processed"


def normalize_column_names(dataframe: pd.DataFrame) -> pd.DataFrame:
    dataframe = dataframe.copy()

    dataframe.columns = (
        dataframe.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
        .str.replace(r"[()]", "", regex=True)
    )

    return dataframe


def parse_currency(series: pd.Series) -> pd.Series:
    return (
        series.astype(str)
        .str.replace("$", "", regex=False)
        .str.replace(",", "", regex=False)
        .str.strip()
        .astype(float)
    )


def create_quality_issue(
    source_file: str,
    source_row: int,
    record_id: str,
    field: str,
    issue_code: str,
    severity: str,
    original_value: Any,
    action: str,
    message: str,
) -> dict:
    return {
        "source_file": source_file,
        "source_row": source_row,
        "record_id": record_id,
        "field": field,
        "issue_code": issue_code,
        "severity": severity,
        "original_value": original_value,
        "action": action,
        "message": message,
    }