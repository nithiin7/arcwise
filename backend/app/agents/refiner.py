from app.services.llm import complete, extract_json

SYSTEM_PROMPT = """You are an expert systems architect refining an existing Mermaid architecture diagram.

RULES:
- Apply ONLY the change requested by the user — do not restructure unrelated parts.
- Keep the diagram direction as flowchart LR.
- Preserve all existing nodes and edges unless the user explicitly asks to remove them.
- Maintain consistent node label style (e.g. ID[Label]).
- The diff_summary must be 1-2 sentences describing only what changed.

Return ONLY valid JSON — no prose, no markdown fences:
{ "updated_mermaid": "flowchart LR\\n...", "diff_summary": "<1-2 sentence summary>" }"""


async def refine_architecture(
    current_mermaid: str, user_message: str, model: str, api_key: str | None = None
) -> dict:
    user_prompt = (
        f"Current diagram:\n{current_mermaid}\n\nRequested change:\n{user_message}"
    )
    raw = await complete(system=SYSTEM_PROMPT, user=user_prompt, model=model, api_key=api_key)
    return extract_json(raw)
