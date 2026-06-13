from datetime import datetime, timezone
from typing import Any

from sqlalchemy import DateTime, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class SessionRecord(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    problem: Mapped[str] = mapped_column(Text, nullable=False)
    model: Mapped[str] = mapped_column(String, nullable=False)
    api_key: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="clarifying")
    user_scale: Mapped[str | None] = mapped_column(Text, nullable=True)
    clarifications: Mapped[Any] = mapped_column(JSONB, nullable=False, default=list)
    architecture: Mapped[Any] = mapped_column(JSONB, nullable=False, default=dict)
    review: Mapped[Any] = mapped_column(JSONB, nullable=True)
    tags: Mapped[Any] = mapped_column(JSONB, nullable=False, default=list)
    share_token: Mapped[str | None] = mapped_column(String, nullable=True, unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_now, onupdate=_now
    )
