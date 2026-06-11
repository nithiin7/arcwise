from app.models.session import Session

_store: dict[str, Session] = {}


async def get_session(session_id: str) -> Session | None:
    return _store.get(session_id)


async def save_session(session: Session) -> None:
    _store[session.id] = session


async def delete_session(session_id: str) -> None:
    _store.pop(session_id, None)
