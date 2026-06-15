from typing import Any

from app.models.session import Session
from app.services.llm import complete, extract_json

SYSTEM_PROMPT = """You are an experienced software architect reviewing a system design for common architecture smells.

Identify concrete, specific problems — not generic advice. Only flag real issues visible in the diagram.

Common smells to look for:
- Single point of failure: one node handles everything with no redundancy
- God service: one service has too many distinct responsibilities
- Missing cache: high-read data flows directly to DB with no caching layer
- Synchronous coupling: services that should be decoupled are directly linked
- Direct DB access: multiple services bypass a service layer to hit the DB
- No auth/gateway: external traffic reaches internal services without a boundary
- Missing queue: high-volume write paths have no buffering

Return ONLY valid JSON — no prose, no markdown:
{
  "smells": [
    {
      "severity": "critical" | "warning",
      "title": "<short smell name>",
      "component": "<affected node or edge>",
      "hint": "<one concrete fix, 10 words max>"
    }
  ]
}

Return an empty smells array if the design looks clean. Never return more than 5 smells."""


def _build_prompt(session: Session) -> str:
    arch = session.architecture
    mermaid = arch.final_mermaid or arch.llm_suggested_mermaid
    lines = [
        f"Problem: {session.problem}",
        f"Scale context: {session.user_scale or 'not specified'}",
        f"\nMermaid diagram:\n{mermaid}",
    ]
    if session.clarifications:
        lines.append("\nClarifications:")
        for qa in session.clarifications:
            if qa.answer:
                lines.append(f"  Q: {qa.question}")
                lines.append(f"  A: {qa.answer}")
    return "\n".join(lines)


async def detect_smells(session: Session) -> tuple[list[dict[str, Any]], Any]:
    user_prompt = _build_prompt(session)
    text, usage = await complete(
        system=SYSTEM_PROMPT,
        user=user_prompt,
        model=session.model,
        api_key=session.api_key,
        max_tokens=1024,
        json_mode=True,
    )
    result = extract_json(text)
    return result.get("smells", []), usage
