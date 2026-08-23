import re

import pandas as pd

from utils import (RAW_DATA_DIRECTORY, create_quality_issue, normalize_column_names)


SOURCE_FILE = "suppliers.csv"


def normalize_supplier_name(supplier_name: str) -> str:
    normalized_name = supplier_name.lower()

    normalized_name = normalized_name.replace("p/l", "")
    normalized_name = normalized_name.replace("pty ltd", "")
    normalized_name = normalized_name.replace("pty. ltd.", "")

    normalized_name = re.sub(
        r"[^a-z0-9\s]",
        "",
        normalized_name,
    )

    normalized_name = " ".join(normalized_name.split())

    return normalized_name


def clean_suppliers() -> tuple[pd.DataFrame, list[dict]]:
    file_path = RAW_DATA_DIRECTORY / SOURCE_FILE

    dataframe = pd.read_csv(file_path, dtype={"abn": str})

    dataframe["source_row"] = dataframe.index + 2

    dataframe = normalize_column_names(dataframe)

    quality_issues = []

    missing_abn_records = dataframe[
        dataframe["abn"].isna()
        | (dataframe["abn"].str.strip() == "")
    ]

    for _, record in missing_abn_records.iterrows():
        quality_issues.append(
            create_quality_issue(
                source_file=SOURCE_FILE,
                source_row=int(record["source_row"]),
                record_id=str(record["supplier_name"]),
                field="abn",
                issue_code="MISSING_ABN",
                severity="warning",
                original_value=None,
                action="flagged",
                message="Supplier ABN is missing.",
            )
        )

    dataframe["abn_normalized"] = (
        dataframe["abn"]
        .fillna("")
        .str.replace(" ", "", regex=False)
    )

    invalid_abn_records = dataframe[
        (dataframe["abn_normalized"] != "")
        & (dataframe["abn_normalized"].str.len() != 11)
    ]

    for _, record in invalid_abn_records.iterrows():
        quality_issues.append(
            create_quality_issue(
                source_file=SOURCE_FILE,
                source_row=int(record["source_row"]),
                record_id=str(record["supplier_name"]),
                field="abn",
                issue_code="INVALID_ABN_FORMAT",
                severity="warning",
                original_value=record["abn"],
                action="flagged",
                message="ABN does not contain 11 digits.",
            )
        )

    duplicate_abn_mask = (
        dataframe["abn_normalized"].ne("")
        & dataframe.duplicated(
            subset=["abn_normalized"],
            keep=False,
        )
    )

    for _, record in dataframe[duplicate_abn_mask].iterrows():
        quality_issues.append(
            create_quality_issue(
                source_file=SOURCE_FILE,
                source_row=int(record["source_row"]),
                record_id=str(record["supplier_name"]),
                field="abn",
                issue_code="DUPLICATE_ABN",
                severity="warning",
                original_value=record["abn"],
                action="flagged",
                message="ABN is associated with multiple supplier records.",
            )
        )

    dataframe["supplier_name_normalized"] = (
        dataframe["supplier_name"]
        .astype(str)
        .apply(normalize_supplier_name)
    )

    duplicate_name_mask = dataframe.duplicated(subset=["supplier_name_normalized"], keep=False)

    duplicate_name_records = dataframe[duplicate_name_mask]

    for _, record in duplicate_name_records.iterrows():
        matching_records = duplicate_name_records[
            (
                duplicate_name_records["supplier_name_normalized"]
                == record["supplier_name_normalized"]
            )
            & (
                duplicate_name_records["supplier_name"]
                != record["supplier_name"]
            )
        ]

        if matching_records.empty:
            continue

        related_suppliers = sorted(
            matching_records["supplier_name"]
            .astype(str)
            .unique()
            .tolist()
        )

        quality_issues.append(
            create_quality_issue(
                source_file=SOURCE_FILE,
                source_row=int(record["source_row"]),
                record_id=str(record["supplier_name"]),
                field="supplier_name",
                issue_code="POSSIBLE_DUPLICATE_SUPPLIER",
                severity="warning",
                original_value=record["supplier_name"],
                action="flagged",
                message=(
                    "Supplier name closely matches another supplier record. "
                    f"Related supplier: {', '.join(related_suppliers)}."
                ),
            )
        )

    return dataframe, quality_issues