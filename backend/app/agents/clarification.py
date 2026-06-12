from app.services.llm import complete, extract_json

SYSTEM_PROMPT = """You are a senior staff engineer conducting a system design interview.
Given a system design problem, generate exactly 5 clarifying questions to ask before proposing any architecture.

Your questions MUST cover all of the following areas — one question per area:
1. Read/write ratio and expected traffic volume (QPS, DAU, data size).
2. CAP theorem preference — consistency vs. availability trade-off for this system.
3. Latency requirements — p99 SLOs for reads and writes.
4. Core features to prioritize for the initial scope (MVP vs. full product).
5. Constraints: geographic distribution, compliance/regulatory requirements, or budget limits.

For each question, also provide exactly 3 short clickable answer options representing common real-world choices. Each option must be under 10 words and be a direct answer (not a question).

Return ONLY valid JSON — no prose, no markdown fences:
{ "questions": [{"question": "q1", "options": ["opt1", "opt2", "opt3"]}, ...] }"""


def _parse_questions(data: dict) -> list[dict]:
    """Accept both {question, options} objects and bare strings (fallback for weaker models)."""
    result = []
    for q in data["questions"]:
        if isinstance(q, str):
            result.append({"question": q, "options": []})
        else:
            result.append({"question": q["question"], "options": q.get("options", [])})
    return result


async def generate_clarifications(
    problem: str, model: str, api_key: str | None = None
) -> list[dict]:
    user_prompt = f"System design problem:\n{problem}"
    raw = await complete(
        system=SYSTEM_PROMPT, user=user_prompt, model=model, api_key=api_key, max_tokens=8192, json_mode=True
    )
    data = extract_json(raw)
    return _parse_questions(data)
