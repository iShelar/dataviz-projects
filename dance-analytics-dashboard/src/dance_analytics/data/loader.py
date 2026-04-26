"""Load and validate the dance dataset."""

from __future__ import annotations

import logging
from pathlib import Path

import pandas as pd

from dance_analytics.data.schema import REQUIRED_COLUMNS
from dance_analytics.data.transforms import apply_transforms

logger = logging.getLogger(__name__)


def load_dataset(csv_path: Path) -> pd.DataFrame:
    """Read CSV from *csv_path*, validate columns, apply transforms."""
    path = csv_path.expanduser().resolve()
    if not path.is_file():
        raise FileNotFoundError(f"Dataset not found: {path}")

    df = pd.read_csv(path)
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(
            f"CSV missing required columns: {missing}. "
            f"Found columns: {list(df.columns)}"
        )

    out = apply_transforms(df)
    logger.info("Loaded dataset rows=%s path=%s", len(out), path)
    return out
