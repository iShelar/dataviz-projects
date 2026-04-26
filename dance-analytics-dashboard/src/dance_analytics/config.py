"""Environment-driven configuration."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


def app_root() -> Path:
    """Assignment/A3 root (contains `data/`, `pyproject.toml`, `assets/`)."""
    return Path(__file__).resolve().parent.parent.parent


@dataclass(frozen=True)
class Settings:
    host: str
    port: int
    debug: bool
    log_level: str
    data_path: Path
    centroids_path: Path
    page_title: str


def _resolve_path(raw: str | None, default: Path) -> Path:
    root = app_root()
    if not raw or not raw.strip():
        path = default
    else:
        path = Path(raw).expanduser()
    if not path.is_absolute():
        path = (root / path).resolve()
    return path


def load_settings() -> Settings:
    load_dotenv(app_root() / ".env", override=False)
    root = app_root()
    data_path = _resolve_path(
        os.environ.get("DANCE_ANALYTICS_DATA_PATH"),
        root / "data" / "original_dance_dataset.csv",
    )
    centroids_path = _resolve_path(
        os.environ.get("DANCE_ANALYTICS_CENTROIDS_PATH"),
        root / "data" / "country_centroids.json",
    )
    return Settings(
        host=os.environ.get("HOST", "127.0.0.1"),
        port=int(os.environ.get("PORT", "8051")),
        debug=os.environ.get("DEBUG", "").lower() in ("1", "true", "yes"),
        log_level=os.environ.get("LOG_LEVEL", "INFO").upper(),
        data_path=data_path,
        centroids_path=centroids_path,
        page_title=os.environ.get("DANCE_ANALYTICS_PAGE_TITLE", "Dance styles analytics"),
    )
