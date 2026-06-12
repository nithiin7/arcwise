# ruff: noqa: I001
"""create sessions table

Revision ID: 6a2bafa1
Revises:
Create Date: 2026-06-12

"""

from collections.abc import Sequence

from alembic import op
from sqlalchemy.dialects.postgresql import JSONB
import sqlalchemy as sa

revision: str = "6a2bafa1"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "sessions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("problem", sa.Text(), nullable=False),
        sa.Column("model", sa.String(), nullable=False),
        sa.Column("api_key", sa.Text(), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="clarifying"),
        sa.Column("user_scale", sa.Text(), nullable=True),
        sa.Column("clarifications", JSONB(), nullable=False, server_default="[]"),
        sa.Column("architecture", JSONB(), nullable=False, server_default="{}"),
        sa.Column("review", JSONB(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_sessions_created_at", "sessions", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_sessions_created_at", table_name="sessions")
    op.drop_table("sessions")
