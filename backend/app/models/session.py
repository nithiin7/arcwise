import uuid
from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field

from app.core.config import settings
from app.models.review import Review
from app.services.llm import LLMUsage


class TokenUsage(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    cost_usd: float = 0.0

    def __add__(self, other: "TokenUsage") -> "TokenUsage":
        return TokenUsage(
            prompt_tokens=self.prompt_tokens + other.prompt_tokens,
            completion_tokens=self.completion_tokens + other.completion_tokens,
            total_tokens=self.total_tokens + other.total_tokens,
            cost_usd=self.cost_usd + other.cost_usd,
        )

    @classmethod
    def from_llm(cls, usage: LLMUsage) -> "TokenUsage":
        return cls(
            prompt_tokens=usage.prompt_tokens,
            completion_tokens=usage.completion_tokens,
            total_tokens=usage.total_tokens,
            cost_usd=usage.cost_usd,
        )


class ClarificationQA(BaseModel):
    question: str
    answer: str = ""
    options: list[str] = []


class Revision(BaseModel):
    user_message: str
    updated_mermaid: str
    diff_summary: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Annotation(BaseModel):
    id: str
    x: float
    y: float
    text: str = ""
    doc_url: str | None = None
    owner: str | None = None
    color: str = "yellow"


class Architecture(BaseModel):
    llm_suggested_mermaid: str = ""
    llm_explanation: str = ""
    component_justifications: dict[str, str] = Field(default_factory=dict)
    scale_assumption: str = ""
    revisions: list[Revision] = Field(default_factory=list)
    final_mermaid: str = ""
    user_description: str | None = None
    annotations: list[Annotation] = Field(default_factory=list)


class Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    problem: str
    model: str = Field(default_factory=lambda: settings.default_model)
    api_key: str | None = Field(default=None, exclude=True, repr=False)
    user_id: str | None = Field(default=None, exclude=True, repr=False)
    user_scale: str | None = None
    clarifications: list[ClarificationQA] = Field(default_factory=list)
    architecture: Architecture = Field(default_factory=Architecture)
    status: Literal["clarifying", "designing", "reviewing", "complete"] = "clarifying"
    review: Review | None = None
    tags: list[str] = Field(default_factory=list)
    token_usage: TokenUsage = Field(default_factory=TokenUsage)
    share_token: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CreateSessionRequest(BaseModel):
    problem: str
    model: str = Field(default_factory=lambda: settings.default_model)
    api_key: str | None = None


class AnswerClarificationRequest(BaseModel):
    answers: list[str]
    user_scale: str | None = None


class RefineArchitectureRequest(BaseModel):
    message: str


class SuggestArchitectureRequest(BaseModel):
    diagram_direction: str = "LR"
    template_id: str | None = None


class SubmitArchitectureRequest(BaseModel):
    user_description: str | None = None


class UpdateMermaidRequest(BaseModel):
    mermaid: str
