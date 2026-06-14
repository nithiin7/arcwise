import json
from collections.abc import AsyncGenerator

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.agents.reviewer import stream_review_design
from app.api.deps import get_session_or_404
from app.models.review import Review
from app.models.session import Session
from app.services.session_store import save_session

router = APIRouter()


@router.post("/{session_id}/review")
async def review(
    session_id: str,
    session: Session = Depends(get_session_or_404),
) -> StreamingResponse:
    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            async for event in stream_review_design(session):
                if event["type"] == "done":
                    session.status = "complete"
                    session.review = Review(**event["review"])
                    await save_session(session)
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
