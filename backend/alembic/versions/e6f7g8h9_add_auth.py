# ruff: noqa: I001
"""add users table and user_id to sessions

Revision ID: e6f7g8h9
Revises: d5e6f7g8
Create Date: 2026-06-14

"""

from alembic import op
import sqlalchemy as sa

revision = "e6f7g8h9"
down_revision = "d5e6f7g8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    if "users" not in existing_tables:
        op.create_table(
            "users",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("email", sa.String(), nullable=False),
            sa.Column("name", sa.String(), nullable=True),
            sa.Column("avatar_url", sa.Text(), nullable=True),
            sa.Column("hashed_password", sa.Text(), nullable=True),
            sa.Column("github_id", sa.String(), nullable=True),
            sa.Column("google_id", sa.String(), nullable=True),
            sa.Column("reset_token", sa.String(), nullable=True),
            sa.Column("reset_token_expires", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("email"),
            sa.UniqueConstraint("github_id"),
            sa.UniqueConstraint("google_id"),
        )
        op.create_index("ix_users_email", "users", ["email"])

    existing_cols = {c["name"] for c in inspector.get_columns("sessions")}
    if "user_id" not in existing_cols:
        op.add_column("sessions", sa.Column("user_id", sa.String(), nullable=True))
        op.create_index("ix_sessions_user_id", "sessions", ["user_id"])
        op.create_foreign_key(
            "fk_sessions_user_id",
            "sessions",
            "users",
            ["user_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    op.drop_constraint("fk_sessions_user_id", "sessions", type_="foreignkey")
    op.drop_index("ix_sessions_user_id", table_name="sessions")
    op.drop_column("sessions", "user_id")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
