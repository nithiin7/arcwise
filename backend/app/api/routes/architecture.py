from typing import Any

from fastapi import APIRouter, Depends

from app.agents.suggester import suggest_architecture
from app.api.deps import get_session_or_404
from app.models.session import (
    Session,
    SubmitArchitectureRequest,
    SuggestArchitectureRequest,
    TokenUsage,
    UpdateMermaidRequest,
)
from app.services.session_store import save_session

router = APIRouter()


@router.post("/{session_id}/architecture/suggest")
async def architecture_suggest(
    session_id: str,
    body: SuggestArchitectureRequest = SuggestArchitectureRequest(),
    session: Session = Depends(get_session_or_404),
) -> dict[str, Any]:
    result, usage = await suggest_architecture(session, body.diagram_direction)
    session.architecture.llm_suggested_mermaid = result.get("mermaid_dsl", "")
    session.architecture.llm_explanation = result.get("explanation", "")
    session.architecture.component_justifications = result.get("component_justifications", {})
    session.architecture.scale_assumption = result.get("scale_assumption", "")
    if not session.tags:
        raw_tags = result.get("tags", [])
        session.tags = [t.lower().strip() for t in raw_tags if isinstance(t, str)][:2]
    session.token_usage = session.token_usage + TokenUsage(
        prompt_tokens=usage.prompt_tokens,
        completion_tokens=usage.completion_tokens,
        total_tokens=usage.total_tokens,
        cost_usd=usage.cost_usd,
    )
    await save_session(session)
    return {
        "explanation": result.get("explanation", ""),
        "mermaid_dsl": result.get("mermaid_dsl", ""),
        "component_justifications": result.get("component_justifications", {}),
        "scale_assumption": result.get("scale_assumption", ""),
    }


@router.patch("/{session_id}/architecture/mermaid")
async def architecture_update_mermaid(
    session_id: str,
    body: UpdateMermaidRequest,
    session: Session = Depends(get_session_or_404),
) -> dict[str, Any]:
    session.architecture.final_mermaid = body.mermaid
    await save_session(session)
    return {"ok": True}


@router.post("/{session_id}/architecture/submit")
async def architecture_submit(
    session_id: str,
    body: SubmitArchitectureRequest,
    session: Session = Depends(get_session_or_404),
) -> dict[str, Any]:
    if body.user_description is not None:
        session.architecture.user_description = body.user_description
    session.status = "reviewing"
    await save_session(session)
    return {"status": "ok"}
