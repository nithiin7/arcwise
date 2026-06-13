import json
import re
from collections.abc import AsyncGenerator
from typing import Any

from anthropic import AsyncAnthropic
from anthropic.types import TextBlock

from app.core.config import settings

_client = AsyncAnthropic(api_key=settings.anthropic_api_key)


async def complete(system: str, user: str, max_tokens: int = 4096) -> str:
    message = await _client.messages.create(
        model=settings.default_model,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    block = message.content[0]
    if not isinstance(block, TextBlock):
        raise TypeError(f"Unexpected content block type: {type(block).__name__}")
    return block.text


async def stream_complete(
    system: str, user: str, max_tokens: int = 4096
) -> AsyncGenerator[str, None]:
    async with _client.messages.stream(
        model=settings.default_model,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user}],
    ) as stream:
        async for text in stream.text_stream:
            yield text


def extract_json(text: str) -> dict[str, Any]:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*\n?", "", stripped)
        stripped = re.sub(r"\n?```\s*$", "", stripped)
    result: dict[str, Any] = json.loads(stripped.strip())
    return result
