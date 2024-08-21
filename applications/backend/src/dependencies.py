from fastapi import Depends
from functools import lru_cache
from typing_extensions import Annotated
from .database.database import Database
from .config import Settings


@lru_cache(maxsize=None, typed=False)
def get_settings() -> Settings:
    return Settings()


@lru_cache(maxsize=None, typed=False)
def get_database(settings: Annotated[Settings, Depends(get_settings)]) -> Database:
    return Database(
        username=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        database_name=settings.POSTGRES_DB,
    )
