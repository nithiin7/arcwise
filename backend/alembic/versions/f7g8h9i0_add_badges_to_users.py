# ruff: noqa: I001
"""add badges column to users

Revision ID: f7g8h9i0
Revises: e6f7g8h9
Create Date: 2026-06-14

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "f7g8h9i0"
down_revision = "e6f7g8h9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_cols = {c["name"] for c in inspector.get_columns("users")}
    if "badges" not in existing_cols:
        op.add_column(
            "users",
            sa.Column("badges", JSONB(), nullable=False, server_default="[]"),
        )


def downgrade() -> None:
    op.drop_column("users", "badges")
