from fastapi import APIRouter, Depends

from app.agents.suggester import suggest_architecture
from app.api.deps import get_session_or_404
from app.models.session import Session, SubmitArchitectureRequest
from app.services.session_store import save_session

router = APIRouter()


@router.post("/{session_id}/architecture/suggest")
async def architecture_suggest(
    session_id: str,
    session: Session = Depends(get_session_or_404),
) -> dict:
    result = await suggest_architecture(session)
    session.architecture.llm_suggested_mermaid = result.get("mermaid_dsl", "")
    session.architecture.llm_explanation = result.get("explanation", "")
    session.architecture.component_justifications = result.get("component_justifications", {})
    session.architecture.scale_assumption = result.get("scale_assumption", "")
    await save_session(session)
    return {
        "explanation": result.get("explanation", ""),
        "mermaid_dsl": result.get("mermaid_dsl", ""),
        "component_justifications": result.get("component_justifications", {}),
        "scale_assumption": result.get("scale_assumption", ""),
    }


@router.post("/{session_id}/architecture/submit")
async def architecture_submit(
    session_id: str,
    body: SubmitArchitectureRequest,
    session: Session = Depends(get_session_or_404),
) -> dict:
    if body.user_description is not None:
        session.architecture.user_description = body.user_description
    session.status = "reviewing"
    await save_session(session)
    return {"status": "ok"}
