from __future__ import annotations

import json
import logging
from pathlib import Path

import numpy as np
import pandas as pd
import plotly.graph_objects as go

logger = logging.getLogger(__name__)


def load_country_coords(path: Path) -> dict[str, tuple[float, float]]:
    """Load lat/lon centroids from JSON (country name -> [lat, lon])."""
    p = path.expanduser().resolve()
    if not p.is_file():
        raise FileNotFoundError(f"Country centroids not found: {p}")
    raw = json.loads(p.read_text(encoding="utf-8"))
    out = {k: (float(v[0]), float(v[1])) for k, v in raw.items()}
    logger.info("Loaded %s country centroids from %s", len(out), p)
    return out


def create_bubble_map(data: pd.DataFrame, country_coords: dict[str, tuple[float, float]]):
    country_stats = data.groupby("Origin").agg(
        {
            "Dance style": "count",
            "Tempo (BPM)": ["mean", "min", "max"],
            "Hardness Ratio": "mean",
            "Learning Difficulty": lambda x: x.mode().iloc[0] if len(x.mode()) > 0 else "Unknown",
        }
    ).reset_index()

    country_stats.columns = [
        "Country",
        "Dance_Count",
        "Avg_Tempo",
        "Min_Tempo",
        "Max_Tempo",
        "Avg_Hardness",
        "Common_Difficulty",
    ]

    country_stats["Lat"] = country_stats["Country"].map(
        lambda x: country_coords.get(x, (0.0, 0.0))[0]
    )
    country_stats["Lon"] = country_stats["Country"].map(
        lambda x: country_coords.get(x, (0.0, 0.0))[1]
    )

    country_stats = country_stats[(country_stats["Lat"] != 0) | (country_stats["Lon"] != 0)]

    country_stats["Bubble_Size"] = np.sqrt(country_stats["Dance_Count"]) * 3
    country_stats["Bubble_Size"] = country_stats["Bubble_Size"].clip(upper=50)

    country_stats["Hover_Text"] = country_stats.apply(
        lambda row: f"<b>{row['Country']}</b><br>"
        f"Dance Styles: {row['Dance_Count']}<br>"
        f"Avg Difficulty: {row['Avg_Hardness']:.2f}<br>"
        f"Avg Tempo: {row['Avg_Tempo']:.1f} BPM<br>"
        f"Tempo Range: {row['Min_Tempo']:.0f}-{row['Max_Tempo']:.0f} BPM<br>"
        f"Common Level: {row['Common_Difficulty']}",
        axis=1,
    )

    fig = go.Figure(
        data=go.Scattergeo(
            lon=country_stats["Lon"],
            lat=country_stats["Lat"],
            text=country_stats["Country"],
            mode="markers",
            marker=dict(
                size=country_stats["Bubble_Size"],
                sizemode="diameter",
                sizeref=1.0,
                sizemin=8,
                color=country_stats["Avg_Hardness"],
                colorscale="RdYlGn_r",
                showscale=True,
                colorbar=dict(title="Avg Difficulty<br>(Hardness)", thickness=15, len=0.7),
                line=dict(width=1, color="white"),
                opacity=0.7,
            ),
            hovertemplate="%{customdata}<extra></extra>",
            customdata=country_stats["Hover_Text"],
        )
    )

    fig.update_layout(
        title_text="Global Dance Distribution Map",
        font_size=10,
        geo=dict(
            projection_type="natural earth",
            showland=True,
            landcolor="rgb(243, 243, 243)",
            coastlinecolor="rgb(204, 204, 204)",
            showocean=True,
            oceancolor="rgb(230, 245, 255)",
            showcountries=True,
            countrycolor="rgb(204, 204, 204)",
        ),
        height=700,
        margin=dict(l=0, r=0, t=40, b=0),
        annotations=[
            dict(
                text=(
                    "Bubble Size = # of Dance Styles<br>"
                    f"Range: {country_stats['Dance_Count'].min()}-"
                    f"{country_stats['Dance_Count'].max()} styles"
                ),
                xref="paper",
                yref="paper",
                x=0.02,
                y=0.98,
                xanchor="left",
                yanchor="top",
                showarrow=False,
                font=dict(size=9, color="#2d3748"),
                bgcolor="rgba(255, 255, 255, 0.8)",
                bordercolor="#667eea",
                borderwidth=1,
                borderpad=4,
            )
        ],
    )

    return fig
