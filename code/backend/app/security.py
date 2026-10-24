"""Office access: a shared key in the X-Admin-Key header (simple first step before real logins)."""

import secrets
from typing import Optional

from fastapi import Depends, Header, HTTPException

from .config import settings


def require_admin_key(x_admin_key: Optional[str] = Header(default=None)) -> None:
    if not settings.admin_key:
        raise HTTPException(status_code=503, detail="Office access is not set up (ADMIN_KEY is empty).")
    if not x_admin_key or not secrets.compare_digest(x_admin_key, settings.admin_key):
        raise HTTPException(status_code=401, detail="Wrong or missing X-Admin-Key")


ADMIN_ONLY = [Depends(require_admin_key)]
