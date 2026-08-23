from pathlib import Path

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DATA_DIRECTORY = PROJECT_ROOT / "data" / "raw"

DATA_FILES = ["fuel_deliveries.csv", "electricity_meter_readings.csv", "incident_register.csv", "suppliers.csv", "emission_factors.csv",]


def print_unique_values(dataframe: pd.DataFrame, column_name: str) -> None:
    if column_name not in dataframe.columns:
        return

    print(f"\nUnique values for '{column_name}':")
    print(dataframe[column_name].value_counts(dropna=False))


def print_duplicate_records(dataframe: pd.DataFrame, column_name: str, label: str) -> None:
    if column_name not in dataframe.columns:
        return

    duplicate_records = dataframe[dataframe.duplicated(subset=[column_name], keep=False)]

    print(f"\n{label}:")
    if duplicate_records.empty:
        print("None")
    else:
        print(duplicate_records)


def profile_fuel_deliveries(dataframe: pd.DataFrame) -> None:
    print_unique_values(dataframe, "Fuel Type ")
    print_unique_values(dataframe, " Unit")

    print_duplicate_records(dataframe, "Invoice No", "Duplicate invoice numbers")

    if "Quantity" in dataframe.columns:
        negative_quantity_records = dataframe[dataframe["Quantity"] < 0]

        print("\nNegative fuel quantities:")
        if negative_quantity_records.empty:
            print("None")
        else:
            print(negative_quantity_records)


def profile_electricity_readings(dataframe: pd.DataFrame) -> None:
    print_unique_values(dataframe, "unit")

    required_columns = {"meter_id", "period"}

    if required_columns.issubset(dataframe.columns):
        duplicate_meter_period_records = dataframe[
            dataframe.duplicated(subset=["meter_id", "period"], keep=False)]

        print("\nDuplicate meter and period combinations:")
        if duplicate_meter_period_records.empty:
            print("None")
        else:
            print(duplicate_meter_period_records)


def profile_incidents(dataframe: pd.DataFrame) -> None:
    print_unique_values(dataframe, "type_code")
    print_unique_values(dataframe, "severity")

    print_duplicate_records(dataframe, "incident_id", "Duplicate incident IDs")


def profile_suppliers(dataframe: pd.DataFrame) -> None:
    print_unique_values(dataframe, "category")


def profile_dataset(file_name: str) -> None:
    file_path = RAW_DATA_DIRECTORY / file_name
    dataframe = pd.read_csv(file_path)

    print("\n" + "=" * 70)
    print(file_name)
    print("=" * 70)

    print(f"\nRows: {len(dataframe)}")
    print(f"Columns: {len(dataframe.columns)}")

    print("\nColumn names:")
    for column_name in dataframe.columns:
        print(repr(column_name))

    print("\nData types:")
    print(dataframe.dtypes)

    print("\nMissing values:")
    print(dataframe.isnull().sum())

    print("\nExact duplicate rows:")
    print(dataframe.duplicated().sum())

    print("\nFirst five rows:")
    print(dataframe.head())

    print("\nSummary statistics:")
    print(dataframe.describe(include="all"))

    if file_name == "fuel_deliveries.csv":
        profile_fuel_deliveries(dataframe)

    elif file_name == "electricity_meter_readings.csv":
        profile_electricity_readings(dataframe)

    elif file_name == "incident_register.csv":
        profile_incidents(dataframe)

    elif file_name == "suppliers.csv":
        profile_suppliers(dataframe)


def main() -> None:
    for file_name in DATA_FILES:
        profile_dataset(file_name)


if __name__ == "__main__":
    main()