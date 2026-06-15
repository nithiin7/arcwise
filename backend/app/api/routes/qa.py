import json
from collections.abc import AsyncGenerator

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.agents.qa import stream_answer
from app.api.deps import get_session_or_404
from app.models.session import FollowUpQA, FollowUpQARequest, Session
from app.services.session_store import save_session

router = APIRouter()


@router.post("/{session_id}/qa")
async def follow_up_qa(
    session_id: str,
    body: FollowUpQARequest,
    session: Session = Depends(get_session_or_404),
) -> StreamingResponse:
    async def event_stream() -> AsyncGenerator[str, None]:
        full_answer = ""
        try:
            async for chunk in stream_answer(session, body.question):
                full_answer += chunk
                yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"
            session.architecture.qa_history.append(
                FollowUpQA(question=body.question, answer=full_answer)
            )
            await save_session(session)
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
