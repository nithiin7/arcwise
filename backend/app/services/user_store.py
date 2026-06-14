import uuid
from datetime import datetime

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

    def to_dict(self) -> dict[str, object]:
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "avatar_url": self.avatar_url,
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
