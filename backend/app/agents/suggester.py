from app.models.session import Session
from app.services.claude import complete, extract_json

SYSTEM_PROMPT = """You are a principal engineer tasked with producing a recommended system architecture.

SCALE GUIDANCE — choose components appropriate for the assumed or stated scale:
- <100K DAU: simple monolith, basic caching (Redis), single primary DB.
- 100K–10M DAU: microservices, message queues (Kafka/SQS), read replicas, CDN for static assets.
- >10M DAU: full horizontal sharding, CDN everywhere, distributed caching, event sourcing, CQRS.

MERMAID RULES — the diagram MUST follow these rules exactly:
- Direction: flowchart LR
- Include ALL major components: clients, load balancer, API gateway, services, databases, caches, queues, CDNs.
- Use descriptive node names with labels, e.g. LB[Load Balancer], API[API Gateway], Cache[Redis Cache].
- Add edge labels that describe data flow, e.g. LB -->|routes| API.
- Group related components inside subgraph blocks with clear titles.

Return ONLY valid JSON — no prose, no markdown fences:
{
  "explanation": "<3-4 paragraphs describing the architecture>",
  "mermaid_dsl": "flowchart LR\\n...",
  "component_justifications": { "ComponentName": "reason for inclusion" },
  "scale_assumption": "<'Assumed X DAU based on problem context' or 'Based on user input: X'>"
}"""


async def suggest_architecture(session: Session) -> dict:
    lines: list[str] = [f"Problem: {session.problem}"]
    if session.user_scale:
        lines.append(f"User-stated scale: {session.user_scale}")
    if session.clarifications:
        lines.append("\nClarifications:")
        for qa in session.clarifications:
            if qa.answer:
                lines.append(f"  Q: {qa.question}")
                lines.append(f"  A: {qa.answer}")
    user_prompt = "\n".join(lines)
    raw = await complete(system=SYSTEM_PROMPT, user=user_prompt, max_tokens=8192)
    return extract_json(raw)
