def extract_improvements(review_data: dict) -> list[dict]:
    return review_data.get("improvements", [])
