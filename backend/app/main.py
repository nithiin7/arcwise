from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import architecture, clarify, refine, review, session
from app.core.config import settings
from app.core.logging import setup_logging


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    setup_logging()
    yield


app = FastAPI(title="Arcwise API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session.router, prefix="/api/sessions")
app.include_router(clarify.router, prefix="/api/sessions")
app.include_router(architecture.router, prefix="/api/sessions")
app.include_router(refine.router, prefix="/api/sessions")
app.include_router(review.router, prefix="/api/sessions")


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
