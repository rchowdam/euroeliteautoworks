import os
import tempfile

# Point the app at a throwaway database BEFORE importing it.
_TMP = tempfile.mkdtemp(prefix="euroeliteautoworks_test_")
os.environ["DATABASE_URL"] = f"sqlite:///{_TMP}/test.db"
os.environ["ADMIN_KEY"] = "test-admin-key"
os.environ["UPLOAD_DIR"] = f"{_TMP}/uploads"
os.environ.pop("S3_BUCKET", None)

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlmodel import SQLModel  # noqa: E402

from app.database import engine, init_db  # noqa: E402
from app.main import app  # noqa: E402

ADMIN = {"X-Admin-Key": "test-admin-key"}


@pytest.fixture()
def client():
    SQLModel.metadata.drop_all(engine)
    init_db()
    with TestClient(app) as c:
        yield c
