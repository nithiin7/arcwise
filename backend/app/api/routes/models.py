import httpx
from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/ollama")
async def list_ollama_models() -> dict:
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.ollama_base_url}/api/tags")
            resp.raise_for_status()
            data = resp.json()
            names = [m["name"] for m in data.get("models", [])]
            return {"models": names}
    except Exception:
        return {"models": []}
