"""Database tables and request/response shapes."""

from datetime import date, datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import field_validator
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class EnquiryStatus(str, Enum):
    new = "new"
    contacted = "contacted"
    booked = "booked"
    closed = "closed"


class EnquiryBase(SQLModel):
    name: str = Field(min_length=2, max_length=80)
    phone: str = Field(min_length=6, max_length=20)
    email: Optional[str] = Field(default=None, max_length=120)
    car_brand: str = Field(max_length=40)
    car_model: Optional[str] = Field(default=None, max_length=60)
    car_year: Optional[int] = Field(default=None, ge=1980, le=2100)
    service: str = Field(max_length=80)
    message: Optional[str] = Field(default=None, max_length=2000)
    preferred_date: Optional[date] = None


class Enquiry(EnquiryBase, table=True):
    """A booking / diagnosis request from the landing page form."""

    id: Optional[int] = Field(default=None, primary_key=True)
    status: EnquiryStatus = Field(default=EnquiryStatus.new, index=True)
    created_at: datetime = Field(default_factory=utcnow, index=True)


class EnquiryCreate(EnquiryBase):
    @field_validator("name", "phone", "car_brand", "service", mode="before")
    @classmethod
    def _strip(cls, v):
        return v.strip() if isinstance(v, str) else v

    @field_validator("email", "car_model", "message", mode="before")
    @classmethod
    def _blank_to_none(cls, v):
        if isinstance(v, str):
            v = v.strip()
        return v or None

    @field_validator("car_year", "preferred_date", mode="before")
    @classmethod
    def _empty_to_none(cls, v):
        return None if v == "" else v

    @field_validator("phone")
    @classmethod
    def _phone_has_digits(cls, v: str) -> str:
        digits = sum(ch.isdigit() for ch in v)
        if digits < 6 or any(not (ch.isdigit() or ch in "+ -()") for ch in v):
            raise ValueError("Enter a valid phone number")
        return v


class EnquiryRead(EnquiryBase):
    id: int
    status: EnquiryStatus
    created_at: datetime


class EnquiryUpdate(SQLModel):
    status: EnquiryStatus


class Media(SQLModel, table=True):
    """A photo or video for the gallery on the landing page."""

    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(max_length=80, unique=True)  # "media/<name>" in UPLOAD_DIR or the S3 bucket
    kind: str = Field(max_length=10)  # photo / video
    size: int = 0
    caption: Optional[str] = Field(default=None, max_length=200)
    published: bool = Field(default=True, index=True)
    created_at: datetime = Field(default_factory=utcnow, index=True)


class MediaUploadRequest(SQLModel):
    content_type: str
    size: int = Field(gt=0)


class MediaCreate(SQLModel):
    key: str
    caption: Optional[str] = Field(default=None, max_length=200)
    published: bool = True

    @field_validator("caption", mode="before")
    @classmethod
    def _blank_to_none(cls, v):
        if isinstance(v, str):
            v = v.strip()
        return v or None


class MediaUpdate(SQLModel):
    caption: Optional[str] = Field(default=None, max_length=200)
    published: Optional[bool] = None

    @field_validator("caption", mode="before")
    @classmethod
    def _strip(cls, v):
        return v.strip() if isinstance(v, str) else v


class MediaRead(SQLModel):
    id: int
    kind: str
    url: str
    caption: Optional[str]
    published: bool
    size: int
    created_at: datetime

    @classmethod
    def of(cls, m: "Media") -> "MediaRead":
        return cls(**m.model_dump(exclude={"key"}), url=f"/{m.key}")
