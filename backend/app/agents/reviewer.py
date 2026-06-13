from app.knowledge.graph import get_reference_note
from app.models.session import Session
from app.services.llm import complete, extract_json

SYSTEM_PROMPT = """You are a senior engineering interviewer evaluating a candidate's system design submission.

SCORING RUBRIC — score each dimension 1–10:
- functional_coverage: Does the design solve all stated requirements?
- nfr_handling: Are scalability, fault tolerance, and latency properly addressed?
- component_justification: Are the right tools chosen with clear, specific reasoning?
- tradeoff_awareness: Does the candidate acknowledge what they gave up (CAP, cost, complexity)?
- overall: Holistic score weighing all dimensions.

Your response MUST include:
- Balanced, constructive feedback (3-4 paragraphs).
- Concrete strengths (what the candidate did well).
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


async def review_design(session: Session) -> dict:
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
        lines.append(f"\nCandidate's explanation:\n{arch.user_description}")
    lines.append(f"\nFinal Mermaid diagram:\n{current_mermaid}")
    if arch.component_justifications:
        lines.append("\nComponent justifications:")
        for comp, reason in arch.component_justifications.items():
            lines.append(f"  {comp}: {reason}")

    reference_note = get_reference_note(session.problem)
    if reference_note:
        lines.append(f"\nReference guidance:\n{reference_note}")

    user_prompt = "\n".join(lines)
    raw = await complete(
        system=SYSTEM_PROMPT, user=user_prompt, model=session.model,
        api_key=session.api_key, max_tokens=8192, json_mode=True,
    )
    return extract_json(raw)
