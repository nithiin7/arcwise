from fastapi import APIRouter

from app.agents.clarification import generate_clarifications
from app.models.session import ClarificationQA, CreateSessionRequest, Session
from app.services.session_store import save_session

router = APIRouter()


@router.post("/")
async def create_session(body: CreateSessionRequest) -> dict:
    questions = await generate_clarifications(body.problem, model=body.model, api_key=body.api_key)
    session = Session(
        problem=body.problem,
        model=body.model,
        api_key=body.api_key,
        clarifications=[ClarificationQA(question=q) for q in questions],
    )
    await save_session(session)
    return {
        "session_id": session.id,
        "problem": session.problem,
        "model": session.model,
        "questions": questions,
    }
