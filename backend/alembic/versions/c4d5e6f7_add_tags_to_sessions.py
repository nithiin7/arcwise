# ruff: noqa: I001
"""add tags to sessions

Revision ID: c4d5e6f7
Revises: b3c4d5e6
Create Date: 2026-06-13

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision: str = "c4d5e6f7"
down_revision: str | None = "b3c4d5e6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "sessions",
        sa.Column("tags", JSONB, nullable=False, server_default="[]"),
    )
    op.create_index(
        "ix_sessions_tags",
        "sessions",
        ["tags"],
        postgresql_using="gin",
    )


def downgrade() -> None:
    op.drop_index("ix_sessions_tags", table_name="sessions")
    op.drop_column("sessions", "tags")
