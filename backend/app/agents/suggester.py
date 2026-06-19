from typing import Any

from app.models.session import Session
from app.services.llm import LLMUsage, complete, extract_json

SYSTEM_PROMPT_TEMPLATE = """You are a principal engineer tasked with producing a recommended system architecture.

SCALE GUIDANCE — choose components appropriate for the assumed or stated scale:
- <100K DAU: simple monolith, basic caching (Redis), single primary DB.
- 100K–10M DAU: microservices, message queues (Kafka/SQS), read replicas, CDN for static assets.
- >10M DAU: full horizontal sharding, CDN everywhere, distributed caching, event sourcing, CQRS.

MERMAID RULES — the diagram MUST follow these rules exactly:
- Direction: flowchart {direction}
- Include ALL major components: clients, load balancer, API gateway, services, databases, caches, queues, CDNs.
- Use descriptive node names with labels, e.g. LB[Load Balancer], API[API Gateway], Cache[Redis Cache].
- Add edge labels that describe data flow, e.g. LB -->|routes| API.
- Group related components inside subgraph blocks with clear titles.

Return ONLY valid JSON — no prose, no markdown fences:
{{
  "explanation": "<3-4 paragraphs describing the architecture>",
  "mermaid_dsl": "flowchart {direction}\\n...",
  "component_justifications": {{ "ComponentName": "reason for inclusion" }},
  "component_alternatives": {{ "ComponentName": ["Alternative A", "Alternative B"] }},
  "component_tradeoffs": {{ "ComponentName": "key tradeoff or limitation of this choice" }},
  "scale_assumption": "<'Assumed X DAU based on problem context' or 'Based on user input: X'>",
  "tags": ["<tag1>", "<tag2>"]
}}

For "tags": exactly 1-2 short lowercase labels (e.g. "url-shortener", "high-scale", "real-time", "microservices", "caching", "streaming"). These categorize the system type and key architectural property."""


async def suggest_architecture(
    session: Session, diagram_direction: str = "LR", template_id: str | None = None
) -> tuple[dict[str, Any], LLMUsage]:
    direction = diagram_direction if diagram_direction in ("LR", "TD") else "LR"
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(direction=direction)
    lines: list[str] = [f"Problem: {session.problem}"]
    if session.user_scale:
        lines.append(f"User-stated scale: {session.user_scale}")
    if session.clarifications:
        lines.append("\nClarifications:")
        for qa in session.clarifications:
            if qa.answer:
                lines.append(f"  Q: {qa.question}")
                lines.append(f"  A: {qa.answer}")
    if template_id:
        from app.knowledge.templates import TEMPLATES_BY_ID
        template = TEMPLATES_BY_ID.get(template_id)
        if template:
            lines.append(f"\nStarting template — {template['name']}:")
            lines.append(
                "Use this as a structural base, adapting components and edges for the problem above:"
            )
            lines.append(template["mermaid_dsl"])
    user_prompt = "\n".join(lines)
    raw, usage = await complete(
        system=system_prompt, user=user_prompt, model=session.model,
        api_key=session.api_key, max_tokens=8192, json_mode=True,
    )
    return extract_json(raw), usage
