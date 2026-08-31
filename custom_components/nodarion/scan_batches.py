"""Small bounded-batch helper used by network discovery."""

from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable, Sequence
from typing import TypeVar


_InputT = TypeVar("_InputT")
_ResultT = TypeVar("_ResultT")


async def async_batched_map(
    values: Sequence[_InputT],
    worker: Callable[[_InputT], Awaitable[_ResultT]],
    batch_size: int,
) -> list[_ResultT]:
    """Map values without creating a task for every address at once."""
    size = max(1, batch_size)
    results: list[_ResultT] = []
    for offset in range(0, len(values), size):
        batch = values[offset : offset + size]
        results.extend(await asyncio.gather(*(worker(value) for value in batch)))
    return results
