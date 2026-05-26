"""Shared license plate normalization for registration and ANPR lookup."""

from typing import Optional


def normalize_plate_key(plate: Optional[str]) -> str:
    """Uppercase, remove all whitespace — stable key for comparison."""
    if not plate:
        return ""
    return "".join(plate.upper().split())


def format_plate_display(plate: Optional[str]) -> str:
    """Human-friendly: single spaces between tokens (best-effort)."""
    if not plate:
        return ""
    return " ".join(plate.upper().split())
