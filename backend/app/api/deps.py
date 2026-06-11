from fastapi import HTTPException

from app.models.session import Session
from app.services.session_store import get_session


async def get_session_or_404(session_id: str) -> Session:
    session = await get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
