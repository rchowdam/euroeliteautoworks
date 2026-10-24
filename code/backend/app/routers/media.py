"""Office: upload and manage gallery photos and videos (needs X-Admin-Key).

Upload in three steps, so big videos go straight to S3 and never through the API:
1. POST /media/uploads        -> where to send the file (a signed S3 form, or /media/local-upload)
2. the browser POSTs the file there
3. POST /media                -> the file is checked and added to the gallery
"""

from typing import List

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from sqlmodel import select

from .. import storage
from ..config import settings
from ..database import SessionDep
from ..models import Media, MediaCreate, MediaRead, MediaUpdate, MediaUploadRequest

router = APIRouter(prefix="/media", tags=["Media"])


@router.post("/uploads")
def start_upload(data: MediaUploadRequest):
    if data.content_type not in {**storage.PHOTO_TYPES, **storage.VIDEO_TYPES}:
        raise HTTPException(status_code=422, detail="Use a JPG, PNG or WebP photo, or an MP4, WebM or MOV video.")
    key = storage.new_key(data.content_type)
    kind = storage.kind_of(key)
    if data.size > storage.max_bytes(kind):
        limit = settings.max_video_mb if kind == "video" else settings.max_photo_mb
        raise HTTPException(status_code=413, detail=f"Too big: a {kind} can be up to {limit} MB.")
    return {"key": key, **storage.upload_target(key)}


@router.post("/local-upload", status_code=204)
def local_upload(key: str = Form(...), file: UploadFile = File(...)):
    """Step 2 when there is no S3 bucket (local development)."""
    if settings.s3_bucket:
        raise HTTPException(status_code=404, detail="Not found")
    if not storage.KEY_RE.match(key):
        raise HTTPException(status_code=422, detail="Bad upload key")
    if storage.save_local(key, file.file, storage.max_bytes(storage.kind_of(key))) < 0:
        raise HTTPException(status_code=413, detail="File is too big.")


@router.post("", response_model=MediaRead, status_code=201)
def add_media(data: MediaCreate, session: SessionDep):
    if not storage.KEY_RE.match(data.key):
        raise HTTPException(status_code=422, detail="Bad upload key")
    if session.exec(select(Media).where(Media.key == data.key)).first():
        raise HTTPException(status_code=409, detail="Already added")
    size = storage.size_of(data.key)
    if size is None:
        raise HTTPException(status_code=422, detail="The file was not uploaded. Please try again.")
    media = Media(key=data.key, kind=storage.kind_of(data.key), size=size,
                  caption=data.caption, published=data.published)
    session.add(media)
    session.commit()
    session.refresh(media)
    return MediaRead.of(media)


@router.get("", response_model=List[MediaRead])
def list_media(session: SessionDep):
    rows = session.exec(select(Media).order_by(Media.created_at.desc())).all()
    return [MediaRead.of(m) for m in rows]


@router.patch("/{media_id}", response_model=MediaRead)
def update_media(media_id: int, data: MediaUpdate, session: SessionDep):
    media = session.get(Media, media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Not found")
    if "caption" in data.model_fields_set:
        media.caption = data.caption or None
    if data.published is not None:
        media.published = data.published
    session.add(media)
    session.commit()
    session.refresh(media)
    return MediaRead.of(media)


@router.delete("/{media_id}", status_code=204)
def delete_media(media_id: int, session: SessionDep):
    media = session.get(Media, media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Not found")
    storage.delete(media.key)
    session.delete(media)
    session.commit()
