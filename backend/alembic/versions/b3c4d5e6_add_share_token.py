# ruff: noqa: I001
"""add share_token to sessions

Revision ID: b3c4d5e6
Revises: 6a2bafa1
Create Date: 2026-06-13

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "b3c4d5e6"
down_revision: str | None = "6a2bafa1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("sessions", sa.Column("share_token", sa.String(), nullable=True))
    op.create_index("ix_sessions_share_token", "sessions", ["share_token"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_sessions_share_token", table_name="sessions")
    op.drop_column("sessions", "share_token")
