import pandas as pd

from utils import (RAW_DATA_DIRECTORY, create_quality_issue, normalize_column_names, parse_currency)


SOURCE_FILE = "fuel_deliveries.csv"


def normalize_fuel_units(dataframe: pd.DataFrame) -> pd.DataFrame:
    dataframe = dataframe.copy()

    normalized_units = dataframe["unit"].str.strip().str.lower()

    kilolitre_mask = normalized_units == "kl"

    dataframe.loc[kilolitre_mask, "quantity"] = (dataframe.loc[kilolitre_mask, "quantity"] * 1000)

    dataframe["unit"] = "L"

    return dataframe


def normalize_delivery_dates(dataframe: pd.DataFrame) -> tuple[pd.DataFrame, list[dict]]:
    dataframe = dataframe.copy()
    quality_issues = []

    dataframe["delivery_date_raw"] = dataframe["delivery_date"]
    dataframe["delivery_date"] = None
    dataframe["delivery_month"] = None
    dataframe["date_precision"] = None

    for index, record in dataframe.iterrows():
        raw_date = str(record["delivery_date_raw"]).strip()

        parsed_full_date = pd.NaT

        for date_format in ("%Y-%m-%d", "%d/%m/%Y"):
            try:
                parsed_full_date = pd.to_datetime(
                    raw_date,
                    format=date_format,
                )
                break
            except ValueError:
                continue

        if not pd.isna(parsed_full_date):
            dataframe.at[index, "delivery_date"] = (parsed_full_date.strftime("%Y-%m-%d"))
            dataframe.at[index, "delivery_month"] = (parsed_full_date.strftime("%Y-%m"))
            dataframe.at[index, "date_precision"] = "day"
            continue

        try:
            parsed_month = pd.to_datetime(raw_date,format="%b-%y")

            dataframe.at[index, "delivery_month"] = (parsed_month.strftime("%Y-%m"))
            dataframe.at[index, "date_precision"] = "month"

            quality_issues.append(
                create_quality_issue(
                    source_file=SOURCE_FILE,
                    source_row=int(record["source_row"]),
                    record_id=str(record["invoice_no"]),
                    field="delivery_date",
                    issue_code="MONTH_ONLY_DATE",
                    severity="info",
                    original_value=raw_date,
                    action="retained_as_month",
                    message=(
                        "Source delivery date contains month and year only; "
                        "day-level date is unavailable."
                    ),
                )
            )

        except ValueError:
            dataframe.at[index, "date_precision"] = "invalid"

            quality_issues.append(
                create_quality_issue(
                    source_file=SOURCE_FILE,
                    source_row=int(record["source_row"]),
                    record_id=str(record["invoice_no"]),
                    field="delivery_date",
                    issue_code="INVALID_DATE",
                    severity="error",
                    original_value=raw_date,
                    action="flagged",
                    message="Delivery date could not be parsed.",
                )
            )

    return dataframe, quality_issues


def clean_fuel_deliveries() -> tuple[pd.DataFrame, list[dict]]:
    file_path = RAW_DATA_DIRECTORY / SOURCE_FILE
    dataframe = pd.read_csv(file_path)

    dataframe["source_row"] = dataframe.index + 2

    quality_issues = []

    source_columns = [
        column_name
        for column_name in dataframe.columns
        if column_name != "source_row"
    ]

    duplicate_mask = dataframe.duplicated(subset=source_columns, keep="first")

    for _, record in dataframe[duplicate_mask].iterrows():
        quality_issues.append(
            create_quality_issue(
                source_file=SOURCE_FILE,
                source_row=int(record["source_row"]),
                record_id=str(record["Invoice No"]),
                field="record",
                issue_code="DUPLICATE_RECORD",
                severity="warning",
                original_value="Exact duplicate row",
                action="excluded",
                message="Exact duplicate record excluded from cleaned data.",
            )
        )

    dataframe = dataframe[~duplicate_mask].copy()

    dataframe = normalize_column_names(dataframe)

    dataframe["cost_aud"] = parse_currency(
        dataframe["cost_aud"]
    )

    negative_quantity_records = dataframe[dataframe["quantity"] < 0]

    for _, record in negative_quantity_records.iterrows():
        quality_issues.append(
            create_quality_issue(
                source_file=SOURCE_FILE,
                source_row=int(record["source_row"]),
                record_id=str(record["invoice_no"]),
                field="quantity",
                issue_code="NEGATIVE_QUANTITY",
                severity="warning",
                original_value=record["quantity"],
                action="flagged",
                message=(
                    "Negative fuel quantity retained because it may represent "
                    "a return, credit, or correction."
                ),
            )
        )

    dataframe = normalize_fuel_units(dataframe)

    dataframe, date_quality_issues = normalize_delivery_dates(dataframe)

    quality_issues.extend(date_quality_issues)

    return dataframe, quality_issues