from fastapi import APIRouter, Depends, HTTPException

from app.agents.refiner import refine_architecture
from app.api.deps import get_session_or_404
from app.models.session import RefineArchitectureRequest, Revision, Session
from app.services.session_store import save_session

router = APIRouter()


@router.post("/{session_id}/refine")
async def refine(
    session_id: str,
    body: RefineArchitectureRequest,
    session: Session = Depends(get_session_or_404),
) -> dict:
    current_mermaid = (
        session.architecture.final_mermaid or session.architecture.llm_suggested_mermaid
    )
    result = await refine_architecture(current_mermaid, body.message, model=session.model, api_key=session.api_key)
    revision = Revision(
        user_message=body.message,
        updated_mermaid=result["updated_mermaid"],
        diff_summary=result["diff_summary"],
    )
    session.architecture.revisions.append(revision)
    session.architecture.final_mermaid = result["updated_mermaid"]
    await save_session(session)
    return {
        "updated_mermaid": result["updated_mermaid"],
        "diff_summary": result["diff_summary"],
        "revision_index": len(session.architecture.revisions) - 1,
    }


@router.post("/{session_id}/refine/revert/{revision_index}")
async def revert(
    session_id: str,
    revision_index: int,
    session: Session = Depends(get_session_or_404),
) -> dict:
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
