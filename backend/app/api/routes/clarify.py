from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_session_or_404
from app.models.session import AnswerClarificationRequest, ClarificationQA, Session
from app.services.session_store import save_session

router = APIRouter()


@router.post("/{session_id}/clarify")
async def clarify(
    session_id: str,
    body: AnswerClarificationRequest,
    session: Session = Depends(get_session_or_404),
) -> dict:
    if len(body.answers) != len(session.clarifications):
        raise HTTPException(
            status_code=422,
            detail=f"Expected {len(session.clarifications)} answers, got {len(body.answers)}",
        )
    session.clarifications = [
        ClarificationQA(question=qa.question, answer=ans)
        for qa, ans in zip(session.clarifications, body.answers)
    ]
    if body.user_scale is not None:
        session.user_scale = body.user_scale
    session.status = "designing"
    await save_session(session)
    return {"status": "ok", "session_id": session_id}
