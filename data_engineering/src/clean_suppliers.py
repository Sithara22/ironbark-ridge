import re

import pandas as pd

from utils import (RAW_DATA_DIRECTORY, create_quality_issue, normalize_column_names)


SOURCE_FILE = "suppliers.csv"


def normalize_supplier_name(supplier_name: str) -> str:
    normalized_name = supplier_name.lower()

    legal_suffixes = [
        "pty ltd",
        "pty. ltd.",
        "p/l",
    ]

    for legal_suffix in legal_suffixes:
        normalized_name = normalized_name.replace(legal_suffix,"")

    normalized_name = re.sub(
        r"[^a-z0-9\s]",
        "",
        normalized_name,
    )

    return " ".join(normalized_name.split())


def add_missing_abn_issues(dataframe: pd.DataFrame, quality_issues: list[dict]) -> None:
    missing_abn_mask = (
        dataframe["abn"].isna()
        | dataframe["abn"].fillna("").str.strip().eq("")
    )

    for _, record in dataframe[missing_abn_mask].iterrows():
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


def add_invalid_abn_issues(dataframe: pd.DataFrame, quality_issues: list[dict]) -> None:
    invalid_abn_mask = (
        dataframe["abn_normalized"].ne("")
        & ~dataframe["abn_normalized"].str.fullmatch(r"\d{11}")
    )

    for _, record in dataframe[invalid_abn_mask].iterrows():
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
                message="ABN does not contain exactly 11 digits.",
            )
        )


def add_supplier_name_inconsistency_issues(dataframe: pd.DataFrame, quality_issues: list[dict]) -> None:
    valid_abn_records = dataframe[
        dataframe["abn_normalized"].str.fullmatch(
            r"\d{11}",
            na=False,
        )
    ]

    for _, group in valid_abn_records.groupby("abn_normalized"):
        supplier_names = (
            group["supplier_name"]
            .astype(str)
            .drop_duplicates()
            .tolist()
        )

        if len(supplier_names) <= 1:
            continue

        for _, record in group.iterrows():
            related_names = [
                supplier_name
                for supplier_name in supplier_names
                if supplier_name != record["supplier_name"]
            ]

            quality_issues.append(
                create_quality_issue(
                    source_file=SOURCE_FILE,
                    source_row=int(record["source_row"]),
                    record_id=str(record["supplier_name"]),
                    field="supplier_name",
                    issue_code="SUPPLIER_NAME_INCONSISTENCY",
                    severity="warning",
                    original_value=record["supplier_name"],
                    action="retained",
                    message=(
                        "The same ABN is associated with inconsistent "
                        "supplier names. Related supplier name: "
                        f"{', '.join(related_names)}."
                    ),
                )
            )


def add_possible_duplicate_supplier_issues(dataframe: pd.DataFrame, quality_issues: list[dict]) -> None:
    duplicate_name_mask = dataframe.duplicated(subset=["supplier_name_normalized"],keep=False)
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

        related_suppliers = (
            matching_records["supplier_name"]
            .astype(str)
            .drop_duplicates()
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
                action="retained",
                message=(
                    "Supplier name closely matches another supplier record. "
                    f"Related supplier: {', '.join(related_suppliers)}."
                ),
            )
        )


def clean_suppliers() -> tuple[pd.DataFrame, list[dict]]:
    file_path = RAW_DATA_DIRECTORY / SOURCE_FILE

    dataframe = pd.read_csv(
        file_path,
        dtype={"abn": str},
    )

    dataframe["source_row"] = dataframe.index + 2
    dataframe = normalize_column_names(dataframe)

    quality_issues = []

    dataframe["abn_normalized"] = (
        dataframe["abn"]
        .fillna("")
        .str.replace(r"\D", "", regex=True)
    )

    dataframe["supplier_name_normalized"] = (
        dataframe["supplier_name"]
        .astype(str)
        .apply(normalize_supplier_name)
    )

    add_missing_abn_issues(dataframe, quality_issues)
    add_invalid_abn_issues(dataframe, quality_issues)
    add_supplier_name_inconsistency_issues(dataframe, quality_issues)
    add_possible_duplicate_supplier_issues(dataframe, quality_issues)

    return dataframe, quality_issues