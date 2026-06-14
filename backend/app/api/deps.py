from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.models.session import Session
from app.services.auth import decode_access_token
from app.services.session_store import get_session
from app.services.user_store import User, get_user_by_id

_bearer = HTTPBearer(auto_error=False)


async def _authenticate(token: str) -> User:
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = await get_user_by_id(payload["user_id"])
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> User:
    if not settings.authentication_required:
        raise HTTPException(status_code=500, detail="Auth dependency used when auth is disabled")
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return await _authenticate(credentials.credentials)


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> User | None:
    """Returns the authenticated user, or None when auth is disabled or no token provided."""
    if not settings.authentication_required:
        return None
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return await _authenticate(credentials.credentials)


async def get_session_or_404(
    session_id: str,
    user: User | None = Depends(get_optional_user),
) -> Session:
    session = await get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    # Owned sessions are only accessible by their owner.
    # Sessions with user_id=None (anonymous) are open to anyone.
    if session.user_id is not None and (user is None or session.user_id != user.id):
        raise HTTPException(status_code=404, detail="Session not found")
    return session
