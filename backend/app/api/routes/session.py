from typing import Any

from fastapi import APIRouter

from app.agents.clarification import generate_clarifications
from app.models.session import ClarificationQA, CreateSessionRequest, Session
from app.services.session_store import list_sessions, save_session

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
