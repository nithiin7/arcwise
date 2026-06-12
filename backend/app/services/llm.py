import json
import logging
import re
from collections.abc import AsyncGenerator
from typing import Any

from litellm import acompletion

from app.core.config import settings

logger = logging.getLogger(__name__)


def _resolve_api_key(model: str, session_key: str | None) -> str | None:
    if session_key:
        return session_key
    if model.startswith("ollama/"):
        return None
    if model.startswith(("claude", "anthropic/")):
        return settings.anthropic_api_key
    if model.startswith(("gpt-", "o1", "o3", "openai/")):
        return settings.openai_api_key
    if model.startswith(("gemini/", "google/")):
        return settings.gemini_api_key
    if model.startswith("xai/"):
        return settings.xai_api_key
    if model.startswith("groq/"):
        return settings.groq_api_key
    return None


def _extra_kwargs(model: str, json_mode: bool = False) -> dict[str, Any]:
    if model.startswith("ollama/"):
        body: dict[str, Any] = {"think": False}
        if json_mode:
            body["format"] = "json"
        return {"api_base": settings.ollama_base_url, "extra_body": body}
    if json_mode:
        return {"response_format": {"type": "json_object"}}
    return {}


async def complete(
    system: str,
    user: str,
    model: str,
    api_key: str | None = None,
    max_tokens: int = 4096,
    json_mode: bool = False,
) -> str:
    response = await acompletion(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        max_tokens=max_tokens,
        api_key=_resolve_api_key(model, api_key),
        **_extra_kwargs(model, json_mode),
    )
    content = response.choices[0].message.content
    logger.warning("LLM raw content (first 300 chars): %r", (content or "")[:300])
    if not isinstance(content, str):
        raise TypeError(f"Unexpected content type: {type(content).__name__}")
    return content


async def stream_complete(
    system: str,
    user: str,
    model: str,
    api_key: str | None = None,
    max_tokens: int = 4096,
) -> AsyncGenerator[str, None]:
    response = await acompletion(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        max_tokens=max_tokens,
        api_key=_resolve_api_key(model, api_key),
        stream=True,
        **_extra_kwargs(model),
    )
    async for chunk in response:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


def extract_json(text: str) -> dict[str, Any]:
    logger.debug("extract_json raw input (first 500 chars): %r", text[:500])
    stripped = text.strip()
    # Strip complete <think>...</think> blocks and any unclosed <think> tail
    stripped = re.sub(r"<think>.*?</think>", "", stripped, flags=re.DOTALL).strip()
    stripped = re.sub(r"<think>.*$", "", stripped, flags=re.DOTALL).strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*\n?", "", stripped)
        stripped = re.sub(r"\n?```\s*$", "", stripped)
    result: dict[str, Any] = json.loads(stripped.strip())
    return result
