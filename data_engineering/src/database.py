import os

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://localhost/ironbark_ridge",
)


def get_database_engine() -> Engine:
    return create_engine(DATABASE_URL)