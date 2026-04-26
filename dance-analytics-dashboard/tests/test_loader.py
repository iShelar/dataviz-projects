from pathlib import Path

import pytest

from dance_analytics.data.loader import load_dataset


def test_load_dataset_smoke():
    root = Path(__file__).resolve().parent.parent
    csv_path = root / "data" / "original_dance_dataset.csv"
    if not csv_path.is_file():
        pytest.skip("dataset not present")
    df = load_dataset(csv_path)
    assert len(df) > 0
    assert "Learning_Difficulty_Numeric" in df.columns
    assert "Time_Period_Numeric" in df.columns


def test_load_dataset_missing_file():
    with pytest.raises(FileNotFoundError):
        load_dataset(Path("/nonexistent/dance.csv"))
