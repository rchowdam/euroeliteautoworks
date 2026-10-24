"""App settings, read from environment variables (see .env.example)."""

import logging
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

logger = logging.getLogger("euroeliteautoworks")


class Settings:
    def __init__(self) -> None:
        self.database_url: str = os.getenv(
            "DATABASE_URL", f"sqlite:///{BASE_DIR / 'data' / 'euroeliteautoworks.db'}"
        )
        # AWS RDS / Aurora with IAM login: no password in DATABASE_URL; a short-lived
        # token is made for each new connection (see database.py).
        self.db_iam_auth = os.getenv("DB_IAM_AUTH", "").strip().lower() in ("1", "true", "yes")
        self.db_iam_region: str = os.getenv("DB_IAM_REGION", "").strip()
        # Set by AWS Lambda itself; used to keep database connections small.
        self.on_lambda = bool(os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
        # Key for the office endpoints (list / update enquiries), sent as X-Admin-Key.
        # Empty = those endpoints are switched off. Replace with real logins later.
        self.admin_key: str = os.getenv("ADMIN_KEY", "").strip()
        self.cors_origins = [
            o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()
        ]
        # Gallery photos and videos. Locally they are files in UPLOAD_DIR; with S3_BUCKET set
        # they go to that (private) bucket under "media/", uploaded straight from the browser.
        self.upload_dir = Path(os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads")))
        self.s3_bucket: str = os.getenv("S3_BUCKET", "").strip()
        self.max_photo_mb: int = int(os.getenv("MAX_PHOTO_MB", "15"))
        self.max_video_mb: int = int(os.getenv("MAX_VIDEO_MB", "300"))
        # The built landing page (`npm run build` in code/frontend), served at "/".
        # On Lambda it is packed inside the code zip as "site/" (see code/deploy/deploy.sh).
        site = BASE_DIR / "site" if self.on_lambda else BASE_DIR.parent / "frontend" / "dist"
        self.frontend_dist = Path(os.getenv("FRONTEND_DIST", str(site)))


settings = Settings()
