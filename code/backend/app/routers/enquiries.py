"""Office: see and follow up enquiries (needs X-Admin-Key)."""

from typing import List, Optional

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from ..database import SessionDep
from ..models import Enquiry, EnquiryRead, EnquiryStatus, EnquiryUpdate

router = APIRouter(prefix="/enquiries", tags=["Enquiries"])


@router.get("", response_model=List[EnquiryRead])
def list_enquiries(session: SessionDep, status: Optional[EnquiryStatus] = None, limit: int = 200):
    query = select(Enquiry).order_by(Enquiry.created_at.desc()).limit(min(limit, 1000))
    if status:
        query = query.where(Enquiry.status == status)
    return session.exec(query).all()


@router.patch("/{enquiry_id}", response_model=EnquiryRead)
def update_enquiry(enquiry_id: int, data: EnquiryUpdate, session: SessionDep):
    enquiry = session.get(Enquiry, enquiry_id)
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    enquiry.status = data.status
    session.add(enquiry)
    session.commit()
    session.refresh(enquiry)
    return enquiry
