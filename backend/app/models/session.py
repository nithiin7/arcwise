import uuid
from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field


class ClarificationQA(BaseModel):
    question: str
    answer: str = ""


class Revision(BaseModel):
    user_message: str
    updated_mermaid: str
    diff_summary: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Architecture(BaseModel):
    llm_suggested_mermaid: str = ""
    llm_explanation: str = ""
    component_justifications: dict[str, str] = Field(default_factory=dict)
    scale_assumption: str = ""
    revisions: list[Revision] = Field(default_factory=list)
    final_mermaid: str = ""
    user_description: str | None = None


class Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    problem: str
    user_scale: str | None = None
    clarifications: list[ClarificationQA] = Field(default_factory=list)
    architecture: Architecture = Field(default_factory=Architecture)
    status: Literal["clarifying", "designing", "reviewing", "complete"] = "clarifying"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CreateSessionRequest(BaseModel):
    problem: str


class AnswerClarificationRequest(BaseModel):
    answers: list[str]
    user_scale: str | None = None


class RefineArchitectureRequest(BaseModel):
    message: str


class SubmitArchitectureRequest(BaseModel):
    user_description: str | None = None
