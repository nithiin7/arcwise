from typing import Any, cast


def extract_improvements(review_data: dict[str, Any]) -> list[dict[str, Any]]:
    return cast(list[dict[str, Any]], review_data.get("improvements", []))
