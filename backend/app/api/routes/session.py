from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.agents.clarification import generate_clarifications
from app.api.deps import get_optional_user, get_session_or_404
from app.models.session import ClarificationQA, CreateSessionRequest, Session, TokenUsage
from app.services.session_store import (
    delete_session,
    list_sessions,
    save_session,
    update_session_tags,
)
from app.services.user_store import User

router = APIRouter()


class UpdateTagsRequest(BaseModel):
    tags: list[str]


@router.get("", include_in_schema=True)
async def get_sessions(
    user: User | None = Depends(get_optional_user),
) -> list[dict[str, Any]]:
    sessions = await list_sessions(user_id=user.id if user else None)
    return [
        {
            "id": s.id,
            "problem": s.problem,
            "model": s.model,
            "status": s.status,
            "overall_score": s.review.scores.overall if s.review else None,
            "tags": s.tags,
            "token_usage": s.token_usage.model_dump() if s.token_usage else None,
            "created_at": s.created_at.isoformat(),
        }
        for s in sessions
    ]


@router.patch("/{session_id}/tags")
async def patch_session_tags(
    body: UpdateTagsRequest,
    session: Session = Depends(get_session_or_404),
) -> dict[str, Any]:
    updated = await update_session_tags(session.id, body.tags)
    if updated is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"id": updated.id, "tags": updated.tags}


@router.get("/{session_id}")
async def get_session_by_id(
    session: Session = Depends(get_session_or_404),
) -> dict[str, Any]:
    return session.model_dump(mode="json", exclude={"api_key"})


@router.delete("/{session_id}", status_code=204)
async def delete_session_by_id(
    session: Session = Depends(get_session_or_404),
) -> None:
    await delete_session(session.id)


@router.post("")
async def create_session(
    body: CreateSessionRequest,
    user: User | None = Depends(get_optional_user),
) -> dict[str, Any]:
    questions_data, usage = await generate_clarifications(
        body.problem, model=body.model, api_key=body.api_key
    )
    session = Session(
        problem=body.problem,
        model=body.model,
        api_key=body.api_key,
        clarifications=[
            ClarificationQA(question=q["question"], options=q.get("options", []))
            for q in questions_data
        ],
        token_usage=TokenUsage.from_llm(usage),
    )
    await save_session(session, user_id=user.id if user else None)
    return {
        "session_id": session.id,
        "problem": session.problem,
        "model": session.model,
        "questions": [
            {"question": c.question, "options": c.options}
            for c in session.clarifications
        ],
    }
