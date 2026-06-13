import secrets
from typing import Any

from fastapi import APIRouter, HTTPException

from app.services.session_store import get_session, get_session_by_share_token, save_session

sessions_router = APIRouter()
public_router = APIRouter()


@sessions_router.post("/{session_id}/share")
async def create_share_link(session_id: str) -> dict[str, str]:
    session = await get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    if not session.share_token:
        session.share_token = secrets.token_urlsafe(16)
        await save_session(session)
    return {"share_token": session.share_token}


@public_router.get("/{token}")
async def get_shared_session(token: str) -> dict[str, Any]:
    session = await get_session_by_share_token(token)
    if session is None:
        raise HTTPException(status_code=404, detail="Shared session not found")
    return session.model_dump(mode="json", exclude={"api_key"})
