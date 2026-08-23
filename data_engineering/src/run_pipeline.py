import shutil

import pandas as pd

from clean_electricity import clean_electricity_readings
from clean_fuel import clean_fuel_deliveries
from clean_incidents import clean_incidents
from clean_suppliers import clean_suppliers
from utils import (PROCESSED_DATA_DIRECTORY, RAW_DATA_DIRECTORY)


def save_dataframe(dataframe: pd.DataFrame, file_name: str) -> None:
    output_path = (PROCESSED_DATA_DIRECTORY / file_name)

    dataframe.to_csv(output_path, index=False)

    print(
        f"Created {output_path.name}: "
        f"{len(dataframe)} rows"
    )


def main() -> None:
    PROCESSED_DATA_DIRECTORY.mkdir(parents=True, exist_ok=True)

    fuel_deliveries, fuel_issues = (clean_fuel_deliveries())

    electricity_readings, electricity_issues = (clean_electricity_readings())

    incidents, incident_issues = clean_incidents()

    suppliers, supplier_issues = clean_suppliers()

    save_dataframe(fuel_deliveries, "fuel_deliveries_clean.csv")
    save_dataframe(electricity_readings, "electricity_meter_readings_clean.csv")
    save_dataframe(incidents, "incident_register_clean.csv")
    save_dataframe(suppliers, "suppliers_clean.csv")

    emission_factor_source = (RAW_DATA_DIRECTORY / "emission_factors.csv")

    emission_factor_destination = (PROCESSED_DATA_DIRECTORY / "emission_factors.csv")

    shutil.copyfile(emission_factor_source, emission_factor_destination)

    quality_issues = (
        fuel_issues
        + electricity_issues
        + incident_issues
        + supplier_issues
    )

    quality_dataframe = pd.DataFrame(quality_issues)

    save_dataframe(quality_dataframe,"data_quality_issues.csv")

    print(
        f"\nTotal data quality issues: "
        f"{len(quality_dataframe)}"
    )


if __name__ == "__main__":
    main()