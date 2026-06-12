from fastapi import APIRouter, Depends

from app.agents.reviewer import review_design
from app.api.deps import get_session_or_404
from app.models.review import Review
from app.models.session import Session
from app.services.session_store import save_session

router = APIRouter()


@router.post("/{session_id}/review")
async def review(
    session_id: str,
    session: Session = Depends(get_session_or_404),
) -> dict:
    result = await review_design(session)
    session.status = "complete"
    session.review = Review(**result)
    await save_session(session)
    return result
