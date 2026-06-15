from typing import Any

from fastapi import APIRouter, Depends

from app.agents.smell_detector import detect_smells
from app.api.deps import get_session_or_404
from app.models.session import Session, TokenUsage
from app.services.session_store import save_session

router = APIRouter()


@router.post("/{session_id}/smells")
async def smells(
    session_id: str,
    session: Session = Depends(get_session_or_404),
) -> dict[str, Any]:
    detected, usage = await detect_smells(session)
    session.token_usage = session.token_usage + TokenUsage.from_llm(usage)
    await save_session(session)
    return {"smells": detected}
