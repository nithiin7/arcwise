# ruff: noqa: I001
"""add token_usage to sessions

Revision ID: d5e6f7g8
Revises: c4d5e6f7
Create Date: 2026-06-13

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision: str = "d5e6f7g8"
down_revision: str | None = "c4d5e6f7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    default = '{"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0, "cost_usd": 0.0}'
    op.add_column(
        "sessions",
        sa.Column("token_usage", JSONB, nullable=True, server_default=default),
    )


def downgrade() -> None:
    op.drop_column("sessions", "token_usage")
