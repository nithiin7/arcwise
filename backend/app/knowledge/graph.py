import json
from difflib import SequenceMatcher
from pathlib import Path

_PROBLEMS: dict[str, dict] = {}

def _load_problems() -> None:
    problems_dir = Path(__file__).parent / "problems"
    for path in problems_dir.glob("*.json"):
        with path.open() as f:
            _PROBLEMS[path.stem] = json.load(f)

_load_problems()


def get_reference_note(problem: str) -> str:
    best_name = None
    best_score = 0.0

    query = problem.lower()
    for name, data in _PROBLEMS.items():
        candidate = f"{name} {data['keywords']}".lower()
        score = SequenceMatcher(None, query, candidate).ratio()
        if score > best_score:
            best_score = score
            best_name = name

    if best_score < 0.2 or best_name is None:
        return (
            "No specific reference found. Focus on clarifying requirements, "
            "estimating scale, and choosing appropriate storage and communication patterns."
        )

    data = _PROBLEMS[best_name]
    patterns = ", ".join(data["patterns"])
    return f"Reference ({best_name}): {data['description']}. Key patterns: {patterns}."
