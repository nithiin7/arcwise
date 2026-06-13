from collections.abc import AsyncGenerator
from typing import Any

from app.knowledge.graph import get_reference_note
from app.models.session import Session
from app.services.llm import extract_json, stream_complete

SYSTEM_PROMPT = """You are a principal engineer conducting a rigorous technical review of a system design.

EVALUATION DIMENSIONS — score each 1–10:
- functional_coverage: Does the design satisfy all stated requirements?
- nfr_handling: Are scalability, fault tolerance, and latency adequately addressed?
- component_justification: Are the right tools chosen with clear, specific reasoning?
- tradeoff_awareness: Does the design acknowledge what was traded off (CAP, cost, complexity)?
- overall: Holistic assessment across all dimensions.

Your response MUST include:
- Balanced, substantive feedback (3-4 paragraphs).
- Concrete strengths (what the design does well).
- Clear gaps (specific shortcomings).
- Prioritised improvements with the component(s) affected.
- scale_verified: true if the design handles the stated/assumed scale, false otherwise.

Return ONLY valid JSON — no prose, no markdown fences:
{
  "scores": {
    "functional_coverage": 0,
    "nfr_handling": 0,
    "component_justification": 0,
    "tradeoff_awareness": 0,
    "overall": 0
  },
  "feedback": "<3-4 paragraphs>",
  "strengths": ["..."],
  "gaps": ["..."],
  "improvements": [
    { "priority": "high|medium|low", "gap": "...", "fix": "...", "components": ["..."] }
  ],
  "scale_verified": true
}"""

_FEEDBACK_MARKER = '"feedback": "'


def _build_prompt(session: Session) -> str:
    arch = session.architecture
    current_mermaid = arch.final_mermaid or arch.llm_suggested_mermaid

    lines: list[str] = [
        f"Problem: {session.problem}",
        f"Scale context: {session.user_scale or 'not specified'}",
    ]
    if session.clarifications:
        lines.append("\nClarifications:")
        for qa in session.clarifications:
            if qa.answer:
                lines.append(f"  Q: {qa.question}")
                lines.append(f"  A: {qa.answer}")
    if arch.user_description:
        lines.append(f"\nDesigner's explanation:\n{arch.user_description}")
    lines.append(f"\nFinal Mermaid diagram:\n{current_mermaid}")
    if arch.component_justifications:
        lines.append("\nComponent justifications:")
        for comp, reason in arch.component_justifications.items():
            lines.append(f"  {comp}: {reason}")

    reference_note = get_reference_note(session.problem)
    if reference_note:
        lines.append(f"\nReference guidance:\n{reference_note}")

    return "\n".join(lines)


async def stream_review_design(session: Session) -> AsyncGenerator[dict[str, Any], None]:
    """Yields {type: chunk, text: ...} events then a final {type: done, review: {...}}."""
    user_prompt = _build_prompt(session)
    full_text = ""
    state = "searching"  # "searching" | "streaming" | "done"
    prev_char = ""

    async for chunk in stream_complete(
        system=SYSTEM_PROMPT,
        user=user_prompt,
        model=session.model,
        api_key=session.api_key,
        max_tokens=8192,
        json_mode=True,
    ):
        full_text += chunk

        if state == "searching":
            if _FEEDBACK_MARKER in full_text:
                state = "streaming"
                idx = full_text.index(_FEEDBACK_MARKER) + len(_FEEDBACK_MARKER)
                tail = full_text[idx:]
                feedback_buf = ""
                for c in tail:
                    if c == '"' and prev_char != "\\":
                        state = "done"
                        break
                    feedback_buf += c
                    prev_char = c
                if feedback_buf:
                    yield {"type": "chunk", "text": feedback_buf}

        elif state == "streaming":
            feedback_buf = ""
            for c in chunk:
                if c == '"' and prev_char != "\\":
                    state = "done"
                    break
                feedback_buf += c
                prev_char = c
            if feedback_buf:
                yield {"type": "chunk", "text": feedback_buf}

    yield {"type": "done", "review": extract_json(full_text)}
