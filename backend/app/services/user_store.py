import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import select

from app.db.engine import AsyncSessionLocal
from app.db.models import UserRecord


class User:
    def __init__(self, record: UserRecord) -> None:
        self.id: str = record.id
        self.email: str = record.email
        self.name: str | None = record.name
        self.avatar_url: str | None = record.avatar_url
        self.hashed_password: str | None = record.hashed_password
        self.github_id: str | None = record.github_id
        self.google_id: str | None = record.google_id
        self.reset_token: str | None = record.reset_token
        self.reset_token_expires: datetime | None = record.reset_token_expires
        self.badges: list[dict[str, Any]] = list(record.badges or [])
        self.created_at: datetime = record.created_at

    def to_dict(self) -> dict[str, object]:
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "avatar_url": self.avatar_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "has_github": self.github_id is not None,
            "has_google": self.google_id is not None,
            "has_password": self.hashed_password is not None,
            "badges": self.badges,
        }


async def get_user_by_id(user_id: str) -> User | None:
    async with AsyncSessionLocal() as db:
        record = await db.get(UserRecord, user_id)
        return User(record) if record else None


async def get_user_by_email(email: str) -> User | None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(UserRecord).where(UserRecord.email == email))
        record = result.scalar_one_or_none()
        return User(record) if record else None


async def get_user_by_github_id(github_id: str) -> User | None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(UserRecord).where(UserRecord.github_id == github_id)
        )
        record = result.scalar_one_or_none()
        return User(record) if record else None


async def get_user_by_google_id(google_id: str) -> User | None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(UserRecord).where(UserRecord.google_id == google_id)
        )
        record = result.scalar_one_or_none()
        return User(record) if record else None


async def get_user_by_reset_token(token: str) -> User | None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(UserRecord).where(UserRecord.reset_token == token)
        )
        record = result.scalar_one_or_none()
        return User(record) if record else None


async def create_user(
    email: str,
    name: str | None = None,
    hashed_password: str | None = None,
    avatar_url: str | None = None,
    github_id: str | None = None,
    google_id: str | None = None,
) -> User:
    async with AsyncSessionLocal() as db:
        record = UserRecord(
            id=str(uuid.uuid4()),
            email=email,
            name=name,
            avatar_url=avatar_url,
            hashed_password=hashed_password,
            github_id=github_id,
            google_id=google_id,
        )
        db.add(record)
        await db.commit()
        await db.refresh(record)
        return User(record)


async def update_user(
    user_id: str,
    *,
    name: str | None = None,
    avatar_url: str | None = None,
    hashed_password: str | None = None,
    github_id: str | None = None,
    google_id: str | None = None,
    reset_token: str | None = None,
    reset_token_expires: datetime | None = None,
) -> User | None:
    async with AsyncSessionLocal() as db:
        record = await db.get(UserRecord, user_id)
        if record is None:
            return None
        if name is not None:
            record.name = name
        if avatar_url is not None:
            record.avatar_url = avatar_url
        if hashed_password is not None:
            record.hashed_password = hashed_password
        if github_id is not None:
            record.github_id = github_id
        if google_id is not None:
            record.google_id = google_id
        # Allow explicitly setting to None to clear these fields
        record.reset_token = reset_token
        record.reset_token_expires = reset_token_expires
        await db.commit()
        await db.refresh(record)
        return User(record)


async def delete_user(user_id: str) -> None:
    async with AsyncSessionLocal() as db:
        record = await db.get(UserRecord, user_id)
        if record:
            await db.delete(record)
            await db.commit()


async def update_user_badges(user_id: str, badges: list[dict[str, Any]]) -> None:
    async with AsyncSessionLocal() as db:
        record = await db.get(UserRecord, user_id)
        if record is not None:
            record.badges = badges
            await db.commit()
