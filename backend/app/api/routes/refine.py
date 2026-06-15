from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.agents.refiner import refine_architecture
from app.api.deps import get_session_or_404
from app.models.session import RefineArchitectureRequest, Revision, Session, TokenUsage
from app.services.badge_service import award_badges
from app.services.session_store import save_session

router = APIRouter()


@router.post("/{session_id}/refine")
async def refine(
    session_id: str,
    body: RefineArchitectureRequest,
    session: Session = Depends(get_session_or_404),
) -> dict[str, Any]:
    current_mermaid = (
        session.architecture.final_mermaid or session.architecture.llm_suggested_mermaid
    )
    result, usage = await refine_architecture(
        current_mermaid, body.message, model=session.model, api_key=session.api_key
    )
    revision = Revision(
        user_message=body.message,
        updated_mermaid=result["updated_mermaid"],
        diff_summary=result["diff_summary"],
    )
    session.architecture.revisions.append(revision)
    session.architecture.final_mermaid = result["updated_mermaid"]
    session.token_usage = session.token_usage + TokenUsage.from_llm(usage)
    await save_session(session)
    new_badges: list[dict[str, Any]] = []
    if session.user_id:
        new_badges = await award_badges(session.user_id, "first_refine")
    return {
        "updated_mermaid": result["updated_mermaid"],
        "diff_summary": result["diff_summary"],
        "revision_index": len(session.architecture.revisions) - 1,
        "new_badges": new_badges,
    }


@router.post("/{session_id}/refine/revert/{revision_index}")
async def revert(
    session_id: str,
    revision_index: int,
    session: Session = Depends(get_session_or_404),
) -> dict[str, Any]:
    revisions = session.architecture.revisions
    if revision_index == -1:
        session.architecture.revisions = []
        session.architecture.final_mermaid = ""
        mermaid = session.architecture.llm_suggested_mermaid
    else:
        if revision_index >= len(revisions):
            raise HTTPException(status_code=422, detail="revision_index out of range")
        session.architecture.revisions = revisions[: revision_index + 1]
        session.architecture.final_mermaid = revisions[revision_index].updated_mermaid
        mermaid = session.architecture.final_mermaid
    await save_session(session)
    return {"mermaid": mermaid}
