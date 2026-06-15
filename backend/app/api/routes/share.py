import secrets
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_session_or_404
from app.models.session import Session
from app.services.badge_service import award_badges
from app.services.session_store import get_session_by_share_token, save_session

sessions_router = APIRouter()
public_router = APIRouter()


@sessions_router.post("/{session_id}/share")
async def create_share_link(
    session: Session = Depends(get_session_or_404),
) -> dict[str, Any]:
    if not session.share_token:
        session.share_token = secrets.token_urlsafe(16)
        await save_session(session)
    new_badges: list[dict[str, Any]] = []
    if session.user_id:
        new_badges = await award_badges(session.user_id, "share_design")
    return {"share_token": session.share_token, "new_badges": new_badges}


@public_router.get("/{token}")
async def get_shared_session(token: str) -> dict[str, Any]:
    session = await get_session_by_share_token(token)
    if session is None:
        raise HTTPException(status_code=404, detail="Shared session not found")
    return session.model_dump(mode="json", exclude={"api_key"})
