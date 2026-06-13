import re

from app.services.llm import LLMUsage, complete, extract_json

SYSTEM_PROMPT = """\
You are an expert systems architect refining an existing Mermaid architecture diagram.

RULES:
- Apply ONLY the change requested by the user — do not restructure unrelated parts.
- Keep the diagram direction as flowchart LR.
- Preserve all existing nodes and edges unless the user explicitly asks to remove them.
- Maintain consistent node label style (e.g. ID[Label]).
- NEVER use the pipe character (|) inside node labels — it is reserved for edge labels
  and will break parsing. Use a slash (/) or space instead.
- The diff_summary must be 1-2 sentences describing only what changed.

Return ONLY valid JSON — no prose, no markdown fences:
{ "updated_mermaid": "flowchart LR\\n...", "diff_summary": "<1-2 sentence summary>" }"""

# Matches node label delimiters: [text], ((text)), (text), {text}
_NODE_LABEL_RE = re.compile(r'(\[[^\[\]]*\]|\(\([^)]*\)\)|\([^)]*\)|{[^}]*})')


def _sanitize_mermaid(mermaid: str) -> str:
    """Replace | inside node label brackets — reserved for edge labels and breaks parsing."""
    return _NODE_LABEL_RE.sub(lambda m: m.group(0).replace("|", "/"), mermaid)


async def refine_architecture(
    current_mermaid: str, user_message: str, model: str, api_key: str | None = None
) -> tuple[dict[str, str], LLMUsage]:
    user_prompt = (
        f"Current diagram:\n{current_mermaid}\n\nRequested change:\n{user_message}"
    )
    raw, usage = await complete(
        system=SYSTEM_PROMPT, user=user_prompt, model=model, api_key=api_key, json_mode=True
    )
    result = extract_json(raw)
    result["updated_mermaid"] = _sanitize_mermaid(result["updated_mermaid"])
    return result, usage
