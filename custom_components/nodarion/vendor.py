"""Offline MAC address vendor lookup."""

from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path
import re
from typing import Any

_DATABASE_PATH = Path(__file__).parent / "data" / "mac_vendors.json"
_HEX_ONLY = re.compile(r"[^0-9A-Fa-f]")
_PREFIX_LENGTHS = (9, 7, 6)


@dataclass(frozen=True, slots=True)
class MacVendor:
    """One matching MAC prefix registration."""

    name: str
    prefix: str
    block_type: str | None
    last_update: str | None
    private: bool


class MacVendorLookup:
    """Load and query the bundled MAC prefix database."""

    def __init__(self, records: list[dict[str, Any]]) -> None:
        self._records: dict[str, MacVendor] = {}
        for record in records:
            prefix = self._normalize(record.get("macPrefix"))
            name = str(record.get("vendorName") or "").strip()
            if not prefix or not name:
                continue
            self._records[prefix] = MacVendor(
                name=name,
                prefix=self._format_prefix(prefix),
                block_type=record.get("blockType"),
                last_update=record.get("lastUpdate"),
                private=bool(record.get("private")),
            )

    @classmethod
    def load(cls) -> MacVendorLookup:
        """Load the bundled JSON database from disk."""
        with _DATABASE_PATH.open(encoding="utf-8") as file:
            records = json.load(file)
        if not isinstance(records, list):
            raise ValueError("MAC vendor database must contain a JSON list")
        return cls(records)

    def lookup(self, mac: str | None) -> MacVendor | None:
        """Return the longest registered prefix matching a global MAC."""
        normalized = self._normalize(mac)
        if len(normalized) != 12 or self.is_locally_administered(normalized):
            return None
        for length in _PREFIX_LENGTHS:
            match = self._records.get(normalized[:length])
            if match is not None:
                return match
        return None

    @staticmethod
    def is_locally_administered(mac: str | None) -> bool:
        """Return whether the MAC uses the local/randomized address bit."""
        normalized = MacVendorLookup._normalize(mac)
        if len(normalized) < 2:
            return False
        return bool(int(normalized[:2], 16) & 0x02)

    @staticmethod
    def _normalize(value: Any) -> str:
        return _HEX_ONLY.sub("", str(value or "")).upper()

    @staticmethod
    def _format_prefix(prefix: str) -> str:
        pairs = [prefix[index : index + 2] for index in range(0, len(prefix), 2)]
        return ":".join(pairs)
