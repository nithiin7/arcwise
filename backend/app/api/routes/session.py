from typing import Any

from fastapi import APIRouter, HTTPException

from app.agents.clarification import generate_clarifications
from app.models.session import ClarificationQA, CreateSessionRequest, Session
from app.services.session_store import delete_session, get_session, list_sessions, save_session

router = APIRouter()


@router.get("", include_in_schema=True)
async def get_sessions() -> list[dict[str, Any]]:
    sessions = await list_sessions()
    return [
        {
            "id": s.id,
            "problem": s.problem,
            "model": s.model,
            "status": s.status,
            "overall_score": s.review.scores.overall if s.review else None,
            "created_at": s.created_at.isoformat(),
        }
        for s in sessions
    ]


@router.get("/{session_id}")
async def get_session_by_id(session_id: str) -> dict[str, Any]:
    session = await get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    data: dict[str, Any] = session.model_dump(mode="json", exclude={"api_key"})
    return data


@router.delete("/{session_id}", status_code=204)
async def delete_session_by_id(session_id: str) -> None:
    session = await get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    await delete_session(session_id)


@router.post("")
async def create_session(body: CreateSessionRequest) -> dict:
    questions_data = await generate_clarifications(body.problem, model=body.model, api_key=body.api_key)
    session = Session(
        problem=body.problem,
        model=body.model,
        api_key=body.api_key,
        clarifications=[
            ClarificationQA(question=q["question"], options=q.get("options", []))
            for q in questions_data
        ],
    )
    await save_session(session)
    return {
        "session_id": session.id,
        "problem": session.problem,
        "model": session.model,
        "questions": [
            {"question": c.question, "options": c.options}
            for c in session.clarifications
        ],
    }
