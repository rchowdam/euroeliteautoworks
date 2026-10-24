"""Where gallery photos and videos are kept.

Locally: files in UPLOAD_DIR, uploaded through the API and served by the app at /media/...
On AWS: S3_BUCKET is set, so the browser uploads straight to s3://<bucket>/media/... with a
short-lived signed form (videos are too big to pass through the API), and the app answers
/media/... with a short-lived signed S3 link. The bucket stays private.
`key` ("media/<name>") is what the database stores.
"""

import os
import re
import uuid
from typing import BinaryIO, Optional

from .config import settings

# Allowed uploads: content type -> file extension.
PHOTO_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
VIDEO_TYPES = {"video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov"}
CONTENT_TYPES = {ext: ct for ct, ext in {**PHOTO_TYPES, **VIDEO_TYPES}.items()}

KEY_RE = re.compile(r"^media/[0-9a-f]{32}\.(jpg|png|webp|mp4|webm|mov)$")

_s3 = None


def _client():
    global _s3
    if _s3 is None:
        import boto3
        from botocore.config import Config

        # Signature v4 on the regional address: needed for signed links in newer
        # regions (e.g. ap-south-2). Lambda sets AWS_REGION.
        region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION")
        _s3 = boto3.client(
            "s3", region_name=region, config=Config(signature_version="s3v4", s3={"addressing_style": "virtual"}),
            endpoint_url=f"https://s3.{region}.amazonaws.com" if region else None,
        )
    return _s3


def kind_of(key: str) -> str:
    return "video" if CONTENT_TYPES[key.rsplit(".", 1)[1]].startswith("video/") else "photo"


def max_bytes(kind: str) -> int:
    return (settings.max_video_mb if kind == "video" else settings.max_photo_mb) * 1024 * 1024


def new_key(content_type: str) -> str:
    ext = {**PHOTO_TYPES, **VIDEO_TYPES}[content_type]
    return f"media/{uuid.uuid4().hex}.{ext}"


def upload_target(key: str) -> dict:
    """Where the browser sends the file: a form POST of `fields` plus the file (as "file", last)."""
    content_type = CONTENT_TYPES[key.rsplit(".", 1)[1]]
    if settings.s3_bucket:
        return _client().generate_presigned_post(
            Bucket=settings.s3_bucket, Key=key,
            Fields={"Content-Type": content_type},
            Conditions=[{"Content-Type": content_type}, ["content-length-range", 1, max_bytes(kind_of(key))]],
            ExpiresIn=15 * 60,
        )
    return {"url": "/api/media/local-upload", "fields": {"key": key}}


def save_local(key: str, src: BinaryIO, limit: int) -> int:
    """Copy an upload into UPLOAD_DIR. Returns the size, or -1 (and keeps nothing) if over `limit`."""
    dest = settings.upload_dir / key
    dest.parent.mkdir(parents=True, exist_ok=True)
    size = 0
    with dest.open("wb") as out:
        while chunk := src.read(1024 * 1024):
            size += len(chunk)
            if size > limit:
                break
            out.write(chunk)
    if size > limit:
        dest.unlink(missing_ok=True)
        return -1
    return size


def size_of(key: str) -> Optional[int]:
    """Size of a stored file, or None if it isn't there (e.g. the upload never finished)."""
    if settings.s3_bucket:
        from botocore.exceptions import ClientError

        try:
            return _client().head_object(Bucket=settings.s3_bucket, Key=key)["ContentLength"]
        except ClientError:
            return None
    path = settings.upload_dir / key
    return path.stat().st_size if path.is_file() else None


def delete(key: str) -> None:
    if settings.s3_bucket:
        _client().delete_object(Bucket=settings.s3_bucket, Key=key)
        return
    (settings.upload_dir / key).unlink(missing_ok=True)


def signed_url(key: str, minutes: int = 60) -> str:
    """A temporary link to a file in the private S3 bucket."""
    return _client().generate_presigned_url(
        "get_object", Params={"Bucket": settings.s3_bucket, "Key": key}, ExpiresIn=minutes * 60,
    )
