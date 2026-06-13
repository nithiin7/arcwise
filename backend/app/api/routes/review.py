from typing import Any

from fastapi import APIRouter, Depends

from app.agents.reviewer import review_design
from app.api.deps import get_session_or_404
from app.models.review import Review
from app.models.session import Session, TokenUsage
from app.services.session_store import save_session

router = APIRouter()


@router.post("/{session_id}/review")
async def review(
    session_id: str,
    session: Session = Depends(get_session_or_404),
) -> dict[str, Any]:
    result, usage = await review_design(session)
    session.status = "complete"
    session.review = Review(**result)
    session.token_usage = session.token_usage + TokenUsage(
        prompt_tokens=usage.prompt_tokens,
        completion_tokens=usage.completion_tokens,
        total_tokens=usage.total_tokens,
        cost_usd=usage.cost_usd,
    )
    await save_session(session)
    return result
