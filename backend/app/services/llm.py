import json
import logging
import re
from collections.abc import AsyncGenerator
from typing import Any

import litellm
from json_repair import repair_json
from litellm import acompletion

from app.core.config import settings


class LLMUsage:
    __slots__ = ("prompt_tokens", "completion_tokens", "total_tokens", "cost_usd")

    def __init__(
        self, prompt_tokens: int, completion_tokens: int, total_tokens: int, cost_usd: float
    ) -> None:
        self.prompt_tokens = prompt_tokens
        self.completion_tokens = completion_tokens
        self.total_tokens = total_tokens
        self.cost_usd = cost_usd

    def to_dict(self) -> dict[str, Any]:
        return {
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "total_tokens": self.total_tokens,
            "cost_usd": self.cost_usd,
        }

logger = logging.getLogger(__name__)


def _is_ollama(model: str) -> bool:
    # Matches both "ollama/qwen3:4b" and bare "qwen3:4b" (tag format, no provider slash)
    return model.startswith("ollama/") or ("/" not in model and ":" in model)


def _resolve_api_key(model: str, session_key: str | None) -> str | None:
    if session_key:
        return session_key
    if _is_ollama(model):
        return None
    if model.startswith(("claude", "anthropic/")):
        return settings.anthropic_api_key
    if model.startswith(("gpt-", "o1", "o3", "o4", "openai/")):
        return settings.openai_api_key
    if model.startswith(("gemini/", "google/")):
        return settings.gemini_api_key
    if model.startswith("xai/"):
        return settings.xai_api_key
    if model.startswith("groq/"):
        return settings.groq_api_key
    return None


def _extra_kwargs(model: str, json_mode: bool = False) -> dict[str, Any]:
    if _is_ollama(model):
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
) -> tuple[str, LLMUsage]:
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
    logger.debug("LLM raw content (first 300 chars): %r", (content or "")[:300])
    if not isinstance(content, str):
        raise TypeError(f"Unexpected content type: {type(content).__name__}")
    usage = response.usage or {}
    try:
        cost = litellm.completion_cost(completion_response=response)
    except Exception:
        cost = 0.0
    llm_usage = LLMUsage(
        prompt_tokens=getattr(usage, "prompt_tokens", 0) or 0,
        completion_tokens=getattr(usage, "completion_tokens", 0) or 0,
        total_tokens=getattr(usage, "total_tokens", 0) or 0,
        cost_usd=cost or 0.0,
    )
    return content, llm_usage


async def stream_complete(
    system: str,
    user: str,
    model: str,
    api_key: str | None = None,
    max_tokens: int = 4096,
    json_mode: bool = False,
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
        **_extra_kwargs(model, json_mode),
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
    stripped = re.sub(r",\s*([}\]])", r"\1", stripped).strip()
    try:
        result: dict[str, Any] = json.loads(stripped)
    except json.JSONDecodeError:
        logger.warning("JSON parse failed, attempting repair")
        result = json.loads(repair_json(stripped))
    return result
