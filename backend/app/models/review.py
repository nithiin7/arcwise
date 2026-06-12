import re
from typing import Literal

from pydantic import BaseModel, field_validator


def _coerce_score(v: object) -> object:
    if isinstance(v, str):
        m = re.search(r"\d+", v)
        if m:
            return int(m.group())
    return v


class Scores(BaseModel):
    functional_coverage: int
    nfr_handling: int
    component_justification: int
    tradeoff_awareness: int
    overall: int

    @field_validator("functional_coverage", "nfr_handling", "component_justification", "tradeoff_awareness", "overall", mode="before")
    @classmethod
    def coerce_score(cls, v: object) -> object:
        return _coerce_score(v)


class Improvement(BaseModel):
    priority: Literal["high", "medium", "low"]
    gap: str
    fix: str
    components: list[str]


class Review(BaseModel):
    scores: Scores
    feedback: str
    strengths: list[str]
    gaps: list[str]
    improvements: list[Improvement]
    reference_architecture_note: str = ""
    scale_verified: bool = False
