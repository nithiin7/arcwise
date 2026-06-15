from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from app.models.review import Review

from app.services.session_store import count_submitted_sessions
from app.services.user_store import get_user_by_id, update_user_badges

BADGES: dict[str, dict[str, str]] = {
    "first_blueprint": {
        "name": "First Blueprint",
        "description": "Submitted your first architecture design",
        "icon": "🏗️",
    },
    "deep_thinker": {
        "name": "Deep Thinker",
        "description": "Submitted 5 architecture designs",
        "icon": "🧠",
    },
    "master_architect": {
        "name": "Master Architect",
        "description": "Submitted 10 architecture designs",
        "icon": "🏆",
    },
    "critic": {
        "name": "Critic",
        "description": "Completed your first design review",
        "icon": "🔍",
    },
    "perfectionist": {
        "name": "Perfectionist",
        "description": "Scored 9 or higher in any review dimension",
        "icon": "⭐",
    },
    "collaborator": {
        "name": "Collaborator",
        "description": "Shared your first design with others",
        "icon": "🤝",
    },
    "refiner": {
        "name": "Refiner",
        "description": "Used the refinement chat to improve a design",
        "icon": "✨",
    },
}


async def award_badges(
    user_id: str,
    event: str,
    review: "Review | None" = None,
) -> list[dict[str, Any]]:
    """Check and award any newly earned badges. Returns newly awarded badge dicts."""
    user = await get_user_by_id(user_id)
    if user is None:
        return []

    existing_ids = {b["id"] for b in user.badges}
    to_award: list[str] = []

    if event == "architecture_submit":
        if "first_blueprint" not in existing_ids:
            to_award.append("first_blueprint")
        if "deep_thinker" not in existing_ids or "master_architect" not in existing_ids:
            count = await count_submitted_sessions(user_id)
            if count >= 5 and "deep_thinker" not in existing_ids:
                to_award.append("deep_thinker")
            if count >= 10 and "master_architect" not in existing_ids:
                to_award.append("master_architect")

    elif event == "review_complete":
        if "critic" not in existing_ids:
            to_award.append("critic")
        if review is not None and "perfectionist" not in existing_ids:
            scores = review.scores
            max_score = max(
                scores.functional_coverage,
                scores.nfr_handling,
                scores.component_justification,
                scores.tradeoff_awareness,
                scores.overall,
            )
            if max_score >= 9:
                to_award.append("perfectionist")

    elif event == "share_design":
        if "collaborator" not in existing_ids:
            to_award.append("collaborator")

    elif event == "first_refine":
        if "refiner" not in existing_ids:
            to_award.append("refiner")

    if not to_award:
        return []

    now = datetime.now(timezone.utc).isoformat()
    new_records = [{"id": bid, "earned_at": now} for bid in to_award]
    await update_user_badges(user_id, user.badges + new_records)

    return [{**BADGES[bid], "id": bid, "earned_at": now} for bid in to_award]
