from __future__ import annotations

import pandas as pd
from dash import dcc, html

from dance_analytics.charts.bubble_map import create_bubble_map
from dance_analytics.charts.pcp import create_pcp
from dance_analytics.charts.sankey import create_sankey
from dance_analytics.charts.small_multiples import create_small_multiples
from dance_analytics.dashboard.constants import (
    BUBBLE_CARD,
    PCP_CARD,
    SANKEY_CARD,
    SANKEY_EXPORT,
    SMALL_MULTIPLES_CARD,
)


def build_layout(df: pd.DataFrame, country_coords: dict[str, tuple[float, float]]):
    return html.Div(
        className="a4-container",
        children=[
            dcc.Store(id="filtered-indices", data=list(df.index)),
            html.Div(
                className="chart-grid",
                children=[
                    html.Div(
                        className="chart-card",
                        children=[
                            html.H2("Parallel coordinates — multi-dimensional analysis"),
                            html.Div(
                                className="chart-wrapper",
                                children=[
                                    dcc.Graph(
                                        id="pcp-graph",
                                        figure=create_pcp(df).update_layout(**PCP_CARD),
                                        config={
                                            "displayModeBar": True,
                                            "displaylogo": False,
                                            "modeBarButtonsToRemove": ["select2d", "lasso2d"],
                                        },
                                        style={"height": "100%"},
                                    )
                                ],
                            ),
                        ],
                    ),
                    html.Div(
                        className="chart-card",
                        children=[
                            html.Div(
                                style={
                                    "display": "flex",
                                    "justifyContent": "space-between",
                                    "alignItems": "center",
                                    "marginBottom": "6px",
                                },
                                children=[
                                    html.H2(
                                        "Global dance distribution map",
                                        style={
                                            "margin": "0",
                                            "borderLeft": "3px solid #667eea",
                                            "paddingLeft": "8px",
                                        },
                                    ),
                                    dcc.Dropdown(
                                        id="country-dropdown",
                                        options=[
                                            {"label": c, "value": c}
                                            for c in sorted(df["Origin"].unique())
                                        ],
                                        placeholder="Search country…",
                                        style={"width": "200px", "fontSize": "0.85rem"},
                                        clearable=True,
                                    ),
                                ],
                            ),
                            html.Div(
                                className="chart-wrapper",
                                children=[
                                    dcc.Graph(
                                        id="bubble-map-graph",
                                        figure=create_bubble_map(df, country_coords).update_layout(
                                            **BUBBLE_CARD
                                        ),
                                        config={
                                            "displayModeBar": True,
                                            "displaylogo": False,
                                            "scrollZoom": True,
                                        },
                                        style={"height": "100%"},
                                    )
                                ],
                            ),
                        ],
                    ),
                    html.Div(
                        className="chart-card",
                        children=[
                            html.H2("Sankey — category flow"),
                            html.Div(
                                className="chart-wrapper",
                                children=[
                                    dcc.Graph(
                                        id="sankey-graph",
                                        figure=create_sankey(df).update_layout(**SANKEY_CARD),
                                        config={
                                            "displayModeBar": True,
                                            "displaylogo": False,
                                            "modeBarButtonsToRemove": ["select2d", "lasso2d"],
                                            "toImageButtonOptions": SANKEY_EXPORT,
                                        },
                                        style={"height": "100%"},
                                    )
                                ],
                            ),
                        ],
                    ),
                    html.Div(
                        className="chart-card",
                        children=[
                            html.H2("Time period distribution"),
                            html.Div(
                                className="chart-wrapper",
                                children=[
                                    dcc.Graph(
                                        id="small-multiples-graph",
                                        figure=create_small_multiples(df).update_layout(
                                            **SMALL_MULTIPLES_CARD
                                        ),
                                        config={
                                            "displayModeBar": True,
                                            "displaylogo": False,
                                            "modeBarButtonsToRemove": ["select2d", "lasso2d"],
                                        },
                                        style={"height": "100%"},
                                    )
                                ],
                            ),
                        ],
                    ),
                ],
            ),
        ],
    )
