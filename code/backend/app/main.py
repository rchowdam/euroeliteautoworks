"""Euro Elite Auto Works API.

Run:  uvicorn app.main:app --reload --env-file .env
Docs: http://localhost:8000/docs
"""

from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse

from . import storage
from .config import logger, settings
from .database import init_db
from .routers import enquiries, media, public
from .security import ADMIN_ONLY


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    if not settings.admin_key:
        logger.warning("ADMIN_KEY is not set: the office endpoints and /admin are switched off.")
    logger.info("Gallery files: %s", f"s3://{settings.s3_bucket}/media/" if settings.s3_bucket else settings.upload_dir)
    yield


app = FastAPI(
    title="Euro Elite Auto Works API",
    version="0.1.0",
    description="Booking enquiries and the photo / video gallery for the landing page.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# No login: the landing page form.
app.include_router(public.router, prefix="/api")

# Office only.
app.include_router(enquiries.router, prefix="/api", dependencies=ADMIN_ONLY)
app.include_router(media.router, prefix="/api", dependencies=ADMIN_ONLY)


@app.get("/health", tags=["System"])
def health():
    return {"status": "ok"}


@app.get("/media/{name}", include_in_schema=False)
def media_file(name: str):
    """A gallery photo or video: the local file, or a redirect to a signed S3 link."""
    key = f"media/{name}"
    if not storage.KEY_RE.match(key):
        raise HTTPException(status_code=404, detail="Not found")
    if settings.s3_bucket:
        return RedirectResponse(storage.signed_url(key), status_code=307)
    file = settings.upload_dir / key
    if not file.is_file():
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(file, media_type=storage.CONTENT_TYPES[name.rsplit(".", 1)[1]])


# ---- Landing page (registered last, so every API route above wins) ----
_site = settings.frontend_dist.resolve()
_has_site = (_site / "index.html").is_file()
if not _has_site:
    logger.info("No landing page build at %s: run `npm run build` in code/frontend.", _site)


def _file_in(folder: Path, path: str) -> Optional[Path]:
    """The file at `path` inside `folder`, or None (also blocks ../ tricks)."""
    file = (folder / path).resolve()
    return file if path and file.is_file() and folder in file.parents else None


@app.get("/{path:path}", include_in_schema=False)
def site(path: str):
    if path.startswith("api/") or not _has_site:
        raise HTTPException(status_code=404, detail="Not found")
    # "/" and the office page "/admin" are the same single-page app.
    file = _file_in(_site, path) if path.rstrip("/") not in ("", "admin") else _site / "index.html"
    if file:
        return FileResponse(file)
    raise HTTPException(status_code=404, detail="Not found")
