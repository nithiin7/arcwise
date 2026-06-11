from app.services.claude import complete, extract_json

SYSTEM_PROMPT = """You are a senior staff engineer conducting a system design interview.
Given a system design problem, generate exactly 5 clarifying questions to ask before proposing any architecture.

Your questions MUST cover all of the following areas — one question per area:
1. Read/write ratio and expected traffic volume (QPS, DAU, data size).
2. CAP theorem preference — consistency vs. availability trade-off for this system.
3. Latency requirements — p99 SLOs for reads and writes.
4. Core features to prioritize for the initial scope (MVP vs. full product).
5. Constraints: geographic distribution, compliance/regulatory requirements, or budget limits.

Return ONLY valid JSON — no prose, no markdown fences:
{ "questions": ["q1", "q2", "q3", "q4", "q5"] }"""


async def generate_clarifications(problem: str) -> list[str]:
    user_prompt = f"System design problem:\n{problem}"
    raw = await complete(system=SYSTEM_PROMPT, user=user_prompt)
    data = extract_json(raw)
    return data["questions"]
