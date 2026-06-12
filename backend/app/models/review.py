from typing import Literal

from pydantic import BaseModel


class Scores(BaseModel):
    functional_coverage: int
    nfr_handling: int
    component_justification: int
    tradeoff_awareness: int
    overall: int


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
