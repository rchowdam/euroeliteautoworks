"""No login: the landing page's booking form posts here, and the gallery reads from here."""

from typing import List

from fastapi import APIRouter
from sqlmodel import select

from ..config import logger
from ..database import SessionDep
from ..models import Enquiry, EnquiryCreate, Media, MediaRead

router = APIRouter(prefix="/public", tags=["Public"])


@router.post("/enquiries", status_code=201)
def create_enquiry(data: EnquiryCreate, session: SessionDep):
    enquiry = Enquiry.model_validate(data)
    session.add(enquiry)
    session.commit()
    session.refresh(enquiry)
    logger.info("New enquiry #%s (%s, %s)", enquiry.id, enquiry.car_brand, enquiry.service)
    return {"id": enquiry.id, "message": "Thank you. We will call you back shortly."}


@router.get("/media", response_model=List[MediaRead])
def gallery(session: SessionDep):
    """Published photos and videos, newest first."""
    query = select(Media).where(Media.published == True).order_by(Media.created_at.desc())  # noqa: E712
    return [MediaRead.of(m) for m in session.exec(query).all()]
