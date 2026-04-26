"""Dash callbacks (linked views)."""

from __future__ import annotations

import logging

import pandas as pd
from dash import Dash, Input, Output, State, callback_context

from dance_analytics.charts.bubble_map import create_bubble_map
from dance_analytics.charts.pcp import create_pcp
from dance_analytics.charts.sankey import create_sankey
from dance_analytics.dashboard.constants import BUBBLE_CARD, PCP_CARD, SANKEY_CARD

logger = logging.getLogger(__name__)


def register_callbacks(
    app: Dash,
    df: pd.DataFrame,
    country_coords: dict[str, tuple[float, float]],
) -> None:
    @app.callback(
        [
            Output("sankey-graph", "figure"),
            Output("pcp-graph", "figure"),
            Output("filtered-indices", "data"),
        ],
        [
            Input("pcp-graph", "restyleData"),
            Input("sankey-graph", "clickData"),
        ],
        [State("filtered-indices", "data")],
    )
    def update_visualizations(pcp_restyle, sankey_click, _current_indices):
        triggered_id = (
            callback_context.triggered[0]["prop_id"].split(".")[0]
            if callback_context.triggered
            else None
        )

        filtered_df = df
        indices = list(df.index)

        if triggered_id == "pcp-graph" and pcp_restyle is not None:
            try:
                constraints = pcp_restyle[0]
                mask = pd.Series([True] * len(df), index=df.index)

                if "dimensions[0].constraintrange" in constraints:
                    ranges = constraints["dimensions[0].constraintrange"]
                    if ranges:
                        tempo_mask = pd.Series([False] * len(df), index=df.index)
                        for r in ranges:
                            tempo_mask |= (df["Tempo (BPM)"] >= r[0]) & (df["Tempo (BPM)"] <= r[1])
                        mask &= tempo_mask

                if "dimensions[1].constraintrange" in constraints:
                    ranges = constraints["dimensions[1].constraintrange"]
                    if ranges:
                        hardness_mask = pd.Series([False] * len(df), index=df.index)
                        for r in ranges:
                            hardness_mask |= (df["Hardness Ratio"] >= r[0]) & (
                                df["Hardness Ratio"] <= r[1]
                            )
                        mask &= hardness_mask

                if "dimensions[2].constraintrange" in constraints:
                    ranges = constraints["dimensions[2].constraintrange"]
                    if ranges:
                        difficulty_mask = pd.Series([False] * len(df), index=df.index)
                        for r in ranges:
                            difficulty_mask |= (df["Learning_Difficulty_Numeric"] >= r[0]) & (
                                df["Learning_Difficulty_Numeric"] <= r[1]
                            )
                        mask &= difficulty_mask

                if "dimensions[3].constraintrange" in constraints:
                    ranges = constraints["dimensions[3].constraintrange"]
                    if ranges:
                        cultural_mask = pd.Series([False] * len(df), index=df.index)
                        for r in ranges:
                            cultural_mask |= (df["Cultural_Significance_Score"] >= r[0]) & (
                                df["Cultural_Significance_Score"] <= r[1]
                            )
                        mask &= cultural_mask

                if "dimensions[4].constraintrange" in constraints:
                    ranges = constraints["dimensions[4].constraintrange"]
                    if ranges:
                        time_mask = pd.Series([False] * len(df), index=df.index)
                        for r in ranges:
                            time_mask |= (df["Time_Period_Numeric"] >= r[0]) & (
                                df["Time_Period_Numeric"] <= r[1]
                            )
                        mask &= time_mask

                filtered_df = df[mask]
                indices = list(filtered_df.index)
            except Exception:
                logger.exception("PCP restyle handling failed; using full dataset")
                filtered_df = df
                indices = list(df.index)

        elif triggered_id == "sankey-graph" and sankey_click is not None:
            try:
                clicked_label = sankey_click["points"][0]["label"]

                if clicked_label in df["Dance Type"].values:
                    filtered_df = df[df["Dance Type"] == clicked_label]
                elif clicked_label in df["Origin"].values:
                    filtered_df = df[df["Origin"] == clicked_label]
                elif clicked_label in df["Age Group"].values:
                    filtered_df = df[df["Age Group"] == clicked_label]
                elif clicked_label in df["Learning Difficulty"].values:
                    filtered_df = df[df["Learning Difficulty"] == clicked_label]

                indices = list(filtered_df.index)
            except Exception:
                logger.exception("Sankey click handling failed; using full dataset")
                filtered_df = df
                indices = list(df.index)

        sankey_fig = create_sankey(filtered_df).update_layout(**SANKEY_CARD)
        pcp_fig = create_pcp(filtered_df).update_layout(**PCP_CARD)
        return sankey_fig, pcp_fig, indices

    @app.callback(
        Output("bubble-map-graph", "figure"),
        [Input("country-dropdown", "value")],
    )
    def zoom_to_country(selected_country):
        fig = create_bubble_map(df, country_coords).update_layout(**BUBBLE_CARD)

        if selected_country and selected_country in country_coords:
            lat, lon = country_coords[selected_country]
            fig.update_geos(
                center=dict(lat=lat, lon=lon),
                projection_scale=15,
                visible=True,
            )
        else:
            fig.update_geos(
                center=dict(lat=0, lon=0),
                projection_scale=1,
                visible=True,
            )

        return fig
