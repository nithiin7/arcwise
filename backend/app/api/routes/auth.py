import logging
import secrets
from datetime import datetime, timezone
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr

from app.api.deps import get_current_user
from app.core.config import settings
from app.services.auth import (
    create_access_token,
    generate_reset_token,
    hash_password,
    verify_password,
)
from app.services.email import send_reset_password_email
from app.services.user_store import (
    User,
    create_user,
    get_user_by_email,
    get_user_by_github_id,
    get_user_by_google_id,
    get_user_by_reset_token,
    update_user,
)

logger = logging.getLogger(__name__)

router = APIRouter()

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAIL_URL = "https://api.github.com/user/emails"

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USER_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str


def _token_response(token: str, user_dict: dict[str, object]) -> dict[str, object]:
    return {"access_token": token, "token_type": "bearer", "user": user_dict}


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)) -> dict[str, object]:
    return user.to_dict()


@router.get("/config")
async def auth_config() -> dict[str, object]:
    return {
        "authentication_required": settings.authentication_required,
        "github_enabled": bool(settings.github_client_id),
        "google_enabled": bool(settings.google_client_id),
    }


@router.post("/register")
async def register(body: RegisterRequest) -> dict[str, object]:
    if len(body.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    existing = await get_user_by_email(body.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    user = await create_user(
        email=body.email,
        name=body.name,
        hashed_password=hash_password(body.password),
    )
    token = create_access_token(user.id, user.email)
    return _token_response(token, user.to_dict())


@router.post("/login")
async def login(body: LoginRequest) -> dict[str, object]:
    user = await get_user_by_email(body.email)
    if user is None or user.hashed_password is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user.id, user.email)
    return _token_response(token, user.to_dict())


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest) -> dict[str, str]:
    user = await get_user_by_email(body.email)
    if user:
        token, expires = generate_reset_token()
        await update_user(user.id, reset_token=token, reset_token_expires=expires)
        await send_reset_password_email(user.email, token)
    # Always return success to avoid email enumeration
    return {"message": "If that email is registered, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest) -> dict[str, object]:
    if len(body.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    user = await get_user_by_reset_token(body.token)
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if user.reset_token_expires and user.reset_token_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    updated = await update_user(
        user.id,
        hashed_password=hash_password(body.password),
        reset_token=None,
        reset_token_expires=None,
    )
    if updated is None:
        raise HTTPException(status_code=500, detail="Failed to update password")
    token = create_access_token(updated.id, updated.email)
    return _token_response(token, updated.to_dict())


# ── GitHub OAuth ──────────────────────────────────────────────────────────────

@router.get("/github")
async def github_login(response: Response) -> RedirectResponse:
    if not settings.github_client_id:
        raise HTTPException(status_code=501, detail="GitHub OAuth not configured")
    state = secrets.token_urlsafe(16)
    response.set_cookie("oauth_state", state, httponly=True, max_age=600, samesite="lax")
    params = urlencode({
        "client_id": settings.github_client_id,
        "scope": "read:user user:email",
        "state": state,
    })
    return RedirectResponse(f"{GITHUB_AUTH_URL}?{params}")


@router.get("/github/callback")
async def github_callback(
    code: str,
    state: str,
    oauth_state: str | None = Cookie(default=None),
) -> RedirectResponse:
    if not settings.github_client_id or not settings.github_client_secret:
        raise HTTPException(status_code=501, detail="GitHub OAuth not configured")
    if oauth_state != state:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    try:
        async with httpx.AsyncClient() as client:
            token_resp = await client.post(
                GITHUB_TOKEN_URL,
                data={
                    "client_id": settings.github_client_id,
                    "client_secret": settings.github_client_secret,
                    "code": code,
                },
                headers={"Accept": "application/json"},
            )
            token_resp.raise_for_status()
            token_data = token_resp.json()
            access_token = token_data.get("access_token")
            if not access_token:
                return RedirectResponse(f"{settings.frontend_url}/login?error=oauth_failed")

            headers = {"Authorization": f"Bearer {access_token}"}
            user_resp = await client.get(GITHUB_USER_URL, headers=headers)
            user_resp.raise_for_status()
            gh_user = user_resp.json()

            # Get primary verified email if not public
            email = gh_user.get("email")
            if not email:
                emails_resp = await client.get(GITHUB_EMAIL_URL, headers=headers)
                emails_resp.raise_for_status()
                emails = emails_resp.json()
                primary = next(
                    (e["email"] for e in emails if e.get("primary") and e.get("verified")),
                    None,
                )
                email = primary
    except httpx.HTTPStatusError as e:
        logger.error("GitHub OAuth HTTP error: %s %s", e.response.status_code, e.response.text)
        return RedirectResponse(f"{settings.frontend_url}/login?error=oauth_failed")

    if not email:
        return RedirectResponse(f"{settings.frontend_url}/login?error=no_email")

    github_id = str(gh_user["id"])
    user = await get_user_by_github_id(github_id)
    if user is None:
        user = await get_user_by_email(email)
        if user:
            await update_user(user.id, github_id=github_id)
            user = await get_user_by_github_id(github_id)
        else:
            user = await create_user(
                email=email,
                name=gh_user.get("name") or gh_user.get("login"),
                avatar_url=gh_user.get("avatar_url"),
                github_id=github_id,
            )

    if user is None:
        return RedirectResponse(f"{settings.frontend_url}/login?error=oauth_failed")

    jwt_token = create_access_token(user.id, user.email)
    return RedirectResponse(f"{settings.frontend_url}/auth/callback?token={jwt_token}")


# ── Google OAuth ──────────────────────────────────────────────────────────────

@router.get("/google")
async def google_login(response: Response) -> RedirectResponse:
    if not settings.google_client_id:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")
    state = secrets.token_urlsafe(16)
    response.set_cookie("oauth_state", state, httponly=True, max_age=600, samesite="lax")
    callback_url = f"{settings.frontend_url.replace('3000', '8000')}/api/auth/google/callback"
    params = urlencode({
        "client_id": settings.google_client_id,
        "redirect_uri": callback_url,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "online",
    })
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{params}")


@router.get("/google/callback")
async def google_callback(
    code: str,
    state: str,
    oauth_state: str | None = Cookie(default=None),
) -> RedirectResponse:
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")
    if oauth_state != state:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    callback_url = f"{settings.frontend_url.replace('3000', '8000')}/api/auth/google/callback"
    try:
        async with httpx.AsyncClient() as client:
            token_resp = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": callback_url,
                },
            )
            token_resp.raise_for_status()
            token_data = token_resp.json()
            access_token = token_data.get("access_token")
            if not access_token:
                return RedirectResponse(f"{settings.frontend_url}/login?error=oauth_failed")

            user_resp = await client.get(
                GOOGLE_USER_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            user_resp.raise_for_status()
            g_user = user_resp.json()
    except httpx.HTTPStatusError as e:
        logger.error("Google OAuth HTTP error: %s %s", e.response.status_code, e.response.text)
        return RedirectResponse(f"{settings.frontend_url}/login?error=oauth_failed")

    google_id = g_user.get("sub")
    email = g_user.get("email")
    if not google_id or not email:
        return RedirectResponse(f"{settings.frontend_url}/login?error=no_email")

    user = await get_user_by_google_id(google_id)
    if user is None:
        user = await get_user_by_email(email)
        if user:
            await update_user(user.id, google_id=google_id)
            user = await get_user_by_google_id(google_id)
        else:
            user = await create_user(
                email=email,
                name=g_user.get("name"),
                avatar_url=g_user.get("picture"),
                google_id=google_id,
            )

    if user is None:
        return RedirectResponse(f"{settings.frontend_url}/login?error=oauth_failed")

    jwt_token = create_access_token(user.id, user.email)
    return RedirectResponse(f"{settings.frontend_url}/auth/callback?token={jwt_token}")
