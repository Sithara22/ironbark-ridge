import pandas as pd

from utils import (RAW_DATA_DIRECTORY, create_quality_issue, normalize_column_names)


SOURCE_FILE = "electricity_meter_readings.csv"


def clean_electricity_readings() -> tuple[pd.DataFrame, list[dict]]:
    file_path = RAW_DATA_DIRECTORY / SOURCE_FILE

    dataframe = pd.read_csv(file_path)
    dataframe["source_row"] = dataframe.index + 2

    dataframe = normalize_column_names(dataframe)

    quality_issues = []

    duplicate_mask = dataframe.duplicated(subset=["meter_id", "period"], keep=False)

    for _, record in dataframe[duplicate_mask].iterrows():
        quality_issues.append(
            create_quality_issue(
                source_file=SOURCE_FILE,
                source_row=int(record["source_row"]),
                record_id=str(record["meter_id"]),
                field="period",
                issue_code="DUPLICATE_METER_PERIOD",
                severity="error",
                original_value=record["period"],
                action="flagged",
                message="Meter has multiple readings for the same period.",
            )
        )

    non_positive_consumption_records = dataframe[dataframe["consumption"] <= 0]

    for _, record in non_positive_consumption_records.iterrows():
        quality_issues.append(
            create_quality_issue(
                source_file=SOURCE_FILE,
                source_row=int(record["source_row"]),
                record_id=str(record["meter_id"]),
                field="consumption",
                issue_code="NON_POSITIVE_CONSUMPTION",
                severity="warning",
                original_value=record["consumption"],
                action="flagged",
                message="Electricity consumption is zero or negative.",
            )
        )

    dataframe["period"] = pd.to_datetime(dataframe["period"], format="%Y-%m").dt.strftime("%Y-%m")

    return dataframe, quality_issues