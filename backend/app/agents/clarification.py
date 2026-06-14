from typing import Any

from app.services.llm import LLMUsage, complete, extract_json

SYSTEM_PROMPT = """You are a friendly product and engineering advisor helping someone think through their system design idea.
Given a system design problem, generate exactly 5 clarifying questions to ask before proposing any architecture.

Your questions MUST be simple enough for a non-technical founder or product manager to answer confidently. Avoid all jargon — no QPS, DAU, p99, CAP theorem, read/write ratio, SLO, or throughput.

Cover these areas — one question per area:
1. Expected scale — roughly how many people will use this? (e.g. a small team, thousands of users, millions of users)
2. Priorities — what matters most: always being available, always showing accurate data, or keeping costs low?
3. Core features — what are the 2–3 most important things users need to be able to do?
4. Audience — who are the users: an internal team, everyday consumers, developers, or businesses?
5. Special needs — does it need to work offline, handle sensitive/private data, or serve users in specific regions?

For each question, also provide exactly 3 short clickable answer options representing common real-world choices. Each option must be under 10 words and be a direct answer (not a question).

Return ONLY valid JSON — no prose, no markdown fences:
{ "questions": [{"question": "q1", "options": ["opt1", "opt2", "opt3"]}, ...] }"""


def _parse_questions(data: dict[str, Any]) -> list[dict[str, Any]]:
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
) -> tuple[list[dict[str, Any]], LLMUsage]:
    user_prompt = f"System design problem:\n{problem}"
    raw, usage = await complete(
        system=SYSTEM_PROMPT, user=user_prompt, model=model,
        api_key=api_key, max_tokens=8192, json_mode=True,
    )
    data = extract_json(raw)
    return _parse_questions(data), usage
