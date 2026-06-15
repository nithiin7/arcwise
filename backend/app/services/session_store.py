from typing import Any

from sqlalchemy import func, select

from app.db.engine import AsyncSessionLocal
from app.db.models import SessionRecord
from app.models.review import Review
from app.models.session import (
    Annotation,
    Architecture,
    ClarificationQA,
    Revision,
    Session,
    TokenUsage,
)


def _record_to_session(record: SessionRecord) -> Session:
    clarifications = [ClarificationQA(**c) for c in (record.clarifications or [])]

    raw_arch = record.architecture or {}
    architecture = Architecture(
        llm_suggested_mermaid=raw_arch.get("llm_suggested_mermaid", ""),
        llm_explanation=raw_arch.get("llm_explanation", ""),
        component_justifications=raw_arch.get("component_justifications", {}),
        scale_assumption=raw_arch.get("scale_assumption", ""),
        revisions=[Revision(**r) for r in raw_arch.get("revisions", [])],
        final_mermaid=raw_arch.get("final_mermaid", ""),
        user_description=raw_arch.get("user_description"),
        annotations=[Annotation(**a) for a in raw_arch.get("annotations", [])],
    )

    raw_usage = record.token_usage or {}
    token_usage = TokenUsage(
        prompt_tokens=raw_usage.get("prompt_tokens", 0),
        completion_tokens=raw_usage.get("completion_tokens", 0),
        total_tokens=raw_usage.get("total_tokens", 0),
        cost_usd=raw_usage.get("cost_usd", 0.0),
    )

    return Session(
        id=record.id,
        problem=record.problem,
        model=record.model,
        api_key=record.api_key,
        user_id=record.user_id,
        user_scale=record.user_scale,
        clarifications=clarifications,
        architecture=architecture,
        status=record.status,  # type: ignore[arg-type]
        review=Review(**record.review) if record.review else None,
        tags=list(record.tags or []),
        token_usage=token_usage,
        share_token=record.share_token,
        created_at=record.created_at,
    )


def _arch_to_json(session: Session) -> dict[str, Any]:
    arch = session.architecture
    return {
        "llm_suggested_mermaid": arch.llm_suggested_mermaid,
        "llm_explanation": arch.llm_explanation,
        "component_justifications": arch.component_justifications,
        "scale_assumption": arch.scale_assumption,
        "revisions": [r.model_dump(mode="json") for r in arch.revisions],
        "final_mermaid": arch.final_mermaid,
        "user_description": arch.user_description,
        "annotations": [a.model_dump(mode="json") for a in arch.annotations],
    }


async def get_session(session_id: str) -> Session | None:
    async with AsyncSessionLocal() as db:
        record = await db.get(SessionRecord, session_id)
        return _record_to_session(record) if record is not None else None


async def save_session(session: Session, user_id: str | None = None) -> None:
    async with AsyncSessionLocal() as db:
        existing = await db.get(SessionRecord, session.id)
        if existing is None:
            db.add(
                SessionRecord(
                    id=session.id,
                    user_id=user_id,
                    problem=session.problem,
                    model=session.model,
                    api_key=session.api_key,
                    status=session.status,
                    user_scale=session.user_scale,
                    clarifications=[c.model_dump(mode="json") for c in session.clarifications],
                    architecture=_arch_to_json(session),
                    review=session.review.model_dump(mode="json") if session.review else None,
                    tags=session.tags,
                    token_usage=session.token_usage.model_dump(),
                    share_token=session.share_token,
                    created_at=session.created_at,
                )
            )
        else:
            existing.problem = session.problem
            existing.model = session.model
            existing.api_key = session.api_key
            existing.status = session.status
            existing.user_scale = session.user_scale
            existing.clarifications = [c.model_dump(mode="json") for c in session.clarifications]
            existing.architecture = _arch_to_json(session)
            existing.review = (
                session.review.model_dump(mode="json") if session.review else None
            )
            existing.tags = session.tags
            existing.token_usage = session.token_usage.model_dump()
            existing.share_token = session.share_token
        await db.commit()


async def delete_session(session_id: str) -> None:
    async with AsyncSessionLocal() as db:
        record = await db.get(SessionRecord, session_id)
        if record is not None:
            await db.delete(record)
            await db.commit()


async def get_session_by_share_token(token: str) -> Session | None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(SessionRecord).where(SessionRecord.share_token == token)
        )
        record = result.scalar_one_or_none()
        return _record_to_session(record) if record is not None else None


async def list_sessions(limit: int = 50, user_id: str | None = None) -> list[Session]:
    async with AsyncSessionLocal() as db:
        q = select(SessionRecord).order_by(SessionRecord.created_at.desc()).limit(limit)
        if user_id is not None:
            q = q.where(SessionRecord.user_id == user_id)
        result = await db.execute(q)
        return [_record_to_session(r) for r in result.scalars()]


async def count_submitted_sessions(user_id: str) -> int:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(func.count())
            .select_from(SessionRecord)
            .where(
                SessionRecord.user_id == user_id,
                SessionRecord.status.in_(["reviewing", "complete"]),
            )
        )
        return result.scalar_one()


async def update_session_tags(session_id: str, tags: list[str]) -> Session | None:
    async with AsyncSessionLocal() as db:
        record = await db.get(SessionRecord, session_id)
        if record is None:
            return None
        record.tags = tags
        await db.commit()
        await db.refresh(record)
        return _record_to_session(record)
