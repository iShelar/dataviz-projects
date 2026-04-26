"""Deterministic transforms applied after CSV load."""

from __future__ import annotations

import pandas as pd


def apply_transforms(df: pd.DataFrame) -> pd.DataFrame:
    """Return a copy with derived numeric columns and documented fill rules."""
    out = df.copy()

    difficulty_mapping = {
        "Very easy": 1,
        "Easy": 2,
        "Moderate": 3,
        "Hard": 4,
        "Difficult": 4,
    }
    out["Learning_Difficulty_Numeric"] = out["Learning Difficulty"].map(difficulty_mapping)

    time_period_mapping = {
        "19th century": 1,
        "Early 20th century": 2,
        "20th century": 3,
        "1970s": 4,
        "Modern": 5,
        "Modern era": 5,
        "Modern Era": 5,
        "Contemporary": 6,
        "21st century": 7,
        "2020s": 8,
    }
    out["Time_Period_Numeric"] = out["Time Period"].map(time_period_mapping)

    # Proxy score for ordering on parallel coords (not semantic "significance").
    out["Cultural_Significance_Score"] = (
        out["Cultural Significance"].fillna("").astype(str).str.len() / 100.0
    )

    out["Tempo (BPM)"] = out["Tempo (BPM)"].fillna(out["Tempo (BPM)"].median())
    out["Hardness Ratio"] = out["Hardness Ratio"].fillna(out["Hardness Ratio"].median())
    out["Learning_Difficulty_Numeric"] = out["Learning_Difficulty_Numeric"].fillna(3)
    out["Time_Period_Numeric"] = out["Time_Period_Numeric"].fillna(5)

    return out
