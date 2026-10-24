"""Database engine, session dependency and first-run setup."""

from pathlib import Path
from typing import Annotated, Iterator

from fastapi import Depends
from sqlalchemy import event, inspect, text
from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel, create_engine

from .config import settings


def _make_engine(url: str) -> Engine:
    if url.startswith("sqlite:///") and ":memory:" not in url:
        Path(url[len("sqlite:///"):]).parent.mkdir(parents=True, exist_ok=True)
    if url.startswith("sqlite"):
        return create_engine(url, connect_args={"check_same_thread": False})
    # Postgres. A Lambda instance handles one request at a time, so it needs
    # only one connection (many instances share the database's limit).
    pool = {"pool_size": 1, "max_overflow": 1} if settings.on_lambda else {}
    eng = create_engine(url, pool_pre_ping=True, **pool)
    if settings.db_iam_auth:
        _use_iam_tokens(eng)
    return eng


def _use_iam_tokens(eng: Engine) -> None:
    """Log in to RDS / Aurora with an IAM token instead of a fixed password.

    A token is valid for 15 minutes, but is only checked when a connection opens,
    so a fresh one is made for each new connection.
    """
    import boto3

    url = eng.url
    # e.g. name.cluster-xxxx.ap-southeast-2.rds.amazonaws.com -> ap-southeast-2
    region = settings.db_iam_region or url.host.split(".")[-4]
    rds = boto3.client("rds", region_name=region)

    @event.listens_for(eng, "do_connect")
    def _fresh_token(_dialect, _record, _cargs, cparams):
        cparams["password"] = rds.generate_db_auth_token(
            DBHostname=url.host, Port=url.port or 5432,
            DBUsername=url.username, Region=region,
        )
        cparams.setdefault("sslmode", "require")  # RDS only accepts IAM logins over SSL


engine = _make_engine(settings.database_url)


def init_db() -> None:
    from . import models  # noqa: F401  (registers the tables)

    SQLModel.metadata.create_all(engine)
    _add_missing_columns()


def _add_missing_columns() -> None:
    """create_all() makes new tables but never changes existing ones: add columns added later."""
    added = {"media": {"place": "VARCHAR(20) NOT NULL DEFAULT 'gallery'"}}
    insp = inspect(engine)
    for table, columns in added.items():
        have = {c["name"] for c in insp.get_columns(table)}
        for name, ddl in columns.items():
            if name not in have:
                with engine.begin() as conn:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {ddl}"))


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
