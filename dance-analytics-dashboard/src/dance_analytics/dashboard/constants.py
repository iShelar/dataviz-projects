"""Shared Plotly layout overrides for dashboard cards."""

CHART_HEIGHT = 340

PCP_CARD = dict(
    height=CHART_HEIGHT,
    margin=dict(l=40, r=40, t=60, b=20),
    font=dict(size=10),
    title_text="",
)

BUBBLE_CARD = dict(
    height=CHART_HEIGHT,
    margin=dict(l=0, r=0, t=15, b=0),
    font=dict(size=9),
    title_text="",
)

SANKEY_CARD = dict(
    height=CHART_HEIGHT,
    margin=dict(t=10, b=5, l=80, r=5),
    font=dict(size=7),
    title_text="",
)

SMALL_MULTIPLES_CARD = dict(
    height=CHART_HEIGHT,
    margin=dict(t=15, b=25, l=35, r=90),
    font=dict(size=8),
    title_text="",
)

SANKEY_EXPORT = dict(
    format="png",
    filename="sankey_diagram",
    height=500,
    width=700,
    scale=2,
)
