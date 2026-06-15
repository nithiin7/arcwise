from collections.abc import AsyncGenerator

from app.models.session import Session
from app.services.llm import stream_complete

SYSTEM_PROMPT = """\
You are an expert systems architect who designed the architecture shown below.
Answer the user's questions about component choices, trade-offs, failure modes, and design decisions.
Be concise and direct (2-4 sentences unless the question requires more depth).
Do not propose unprompted changes — focus on explaining the existing design."""


def _build_prompt(session: Session, question: str) -> str:
    arch = session.architecture
    parts: list[str] = [f"Problem: {session.problem}"]
    if session.user_scale:
        parts.append(f"Scale: {session.user_scale}")
    if arch.scale_assumption:
        parts.append(f"Scale assumption: {arch.scale_assumption}")
    if arch.llm_explanation:
        parts.append(f"Architecture overview: {arch.llm_explanation}")
    if arch.component_justifications:
        justifications = "\n".join(
            f"- {k}: {v}" for k, v in arch.component_justifications.items()
        )
        parts.append(f"Component justifications:\n{justifications}")
    mermaid = arch.final_mermaid or arch.llm_suggested_mermaid
    if mermaid:
        parts.append(f"Mermaid diagram:\n{mermaid}")
    if arch.qa_history:
        history = "\n\n".join(f"Q: {qa.question}\nA: {qa.answer}" for qa in arch.qa_history)
        parts.append(f"Previous Q&A:\n{history}")
    return "\n\n".join(parts) + f"\n\nQuestion: {question}"


async def stream_answer(session: Session, question: str) -> AsyncGenerator[str, None]:
    user_prompt = _build_prompt(session, question)
    async for chunk in stream_complete(
        system=SYSTEM_PROMPT, user=user_prompt, model=session.model, api_key=session.api_key
    ):
        yield chunk
