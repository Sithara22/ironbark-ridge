import pandas as pd

from database import get_database_engine
from utils import PROCESSED_DATA_DIRECTORY


TABLE_FILES = {
    "fuel_deliveries": "fuel_deliveries_clean.csv",
    "electricity_readings": "electricity_meter_readings_clean.csv",
    "incidents": "incident_register_clean.csv",
    "suppliers": "suppliers_clean.csv",
    "data_quality_issues": "data_quality_issues.csv",
    "emission_factors": "emission_factors.csv",
}

DATE_COLUMNS = {
    "fuel_deliveries": ["delivery_date"],
    "incidents": ["incident_date"],
}


def prepare_dataframe(dataframe: pd.DataFrame, table_name: str) -> pd.DataFrame:
    dataframe = dataframe.copy()

    for column_name in DATE_COLUMNS.get(table_name, []):
        dataframe[column_name] = pd.to_datetime(
            dataframe[column_name],
            errors="coerce",
        ).dt.date

    return dataframe


def load_table(table_name: str, file_name: str, database_engine) -> None:
    file_path = PROCESSED_DATA_DIRECTORY / file_name

    dataframe = pd.read_csv(file_path)

    dataframe = prepare_dataframe(dataframe, table_name)

    dataframe.to_sql(
        table_name,
        database_engine,
        if_exists="append",
        index=False,
        method="multi",
    )

    print(
        f"Loaded {len(dataframe)} rows into "
        f"'{table_name}'"
    )


def main() -> None:
    database_engine = get_database_engine()

    for table_name, file_name in TABLE_FILES.items():
        load_table(
            table_name,
            file_name,
            database_engine,
        )


if __name__ == "__main__":
    main()