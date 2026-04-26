import plotly.graph_objects as go
from plotly.subplots import make_subplots


def create_small_multiples(data):
    time_period_groups = {
        "Historical": ["19th century", "Early 20th century"],
        "20th Century": ["20th century", "1970s"],
        "Contemporary": ["Contemporary", "21st century"],
        "Modern": ["Modern", "Modern era", "Modern Era", "2020s"],
    }

    def map_to_group(period):
        for group, periods in time_period_groups.items():
            if period in periods:
                return group
        return "Other"

    data = data.copy()
    data["Time_Period_Group"] = data["Time Period"].apply(map_to_group)

    data = data[data["Time_Period_Group"] != "Other"]

    period_order = ["Historical", "20th Century", "Contemporary", "Modern"]

    dance_type_abbrev = {
        "American": "American",
        "Belly dance": "Belly",
        "Ceremonial dance": "Ceremonial",
        "Disco Soul dance": "Disco Soul",
        "Free and improvised dance": "Free/Improv",
        "Historical dance": "Historical",
        "Latin dance / Rhythm": "Latin",
        "Novelty and fad dances": "Novelty",
        "Social dance": "Social",
        "Street dance / Electronic dance": "Street/EDM",
        "Swing dance": "Swing",
        "Other": "Other",
    }

    fig = make_subplots(
        rows=2,
        cols=2,
        subplot_titles=period_order,
        specs=[[{"type": "bar"}, {"type": "bar"}], [{"type": "bar"}, {"type": "bar"}]],
        vertical_spacing=0.20,
        horizontal_spacing=0.12,
    )

    dance_type_colors = {
        "American": "#667eea",
        "Belly dance": "#764ba2",
        "Ceremonial dance": "#f093fb",
        "Disco Soul dance": "#4facfe",
        "Free and improvised dance": "#43e97b",
        "Historical dance": "#fa709a",
        "Latin dance / Rhythm": "#fee140",
        "Novelty and fad dances": "#30cfd0",
        "Social dance": "#a8edea",
        "Street dance / Electronic dance": "#ff9a9e",
        "Swing dance": "#fbc2eb",
        "Other": "#c2e9fb",
    }

    positions = {
        "Historical": (1, 1),
        "20th Century": (1, 2),
        "Contemporary": (2, 1),
        "Modern": (2, 2),
    }

    legend_added = set()

    global_max = 0
    for period in period_order:
        if period in data["Time_Period_Group"].values:
            period_data = data[data["Time_Period_Group"] == period]
            dance_counts = period_data.groupby("Dance Type").size()
            if len(dance_counts) > 0:
                global_max = max(global_max, dance_counts.max())

    for period in period_order:
        if period not in data["Time_Period_Group"].values:
            continue

        period_data = data[data["Time_Period_Group"] == period]

        dance_counts = period_data.groupby("Dance Type").size().reset_index(name="count")
        dance_counts = dance_counts.sort_values("count", ascending=False)

        row, col = positions[period]

        for _, row_data in dance_counts.iterrows():
            dance_type = row_data["Dance Type"]
            count = row_data["count"]
            abbrev_name = dance_type_abbrev.get(dance_type, dance_type)

            show_legend = dance_type not in legend_added
            if show_legend:
                legend_added.add(dance_type)

            fig.add_trace(
                go.Bar(
                    x=[abbrev_name],
                    y=[count],
                    name=dance_type,
                    marker_color=dance_type_colors.get(dance_type, "#cccccc"),
                    showlegend=show_legend,
                    legendgroup=dance_type,
                    hovertemplate=f"<b>{dance_type}</b><br>Count: {count}<extra></extra>",
                    width=0.7,
                ),
                row=row,
                col=col,
            )

    fig.update_layout(
        title_text="Dance Distribution Across Time Periods",
        font_size=10,
        height=650,
        margin=dict(t=70, b=80, l=60, r=140),
        showlegend=True,
        legend=dict(
            orientation="v",
            yanchor="top",
            y=0.98,
            xanchor="left",
            x=1.02,
            bgcolor="rgba(255, 255, 255, 0.95)",
            bordercolor="rgba(0, 0, 0, 0.2)",
            borderwidth=1,
            font=dict(size=8),
            title=dict(text="Dance Types", font=dict(size=9)),
        ),
        barmode="group",
    )

    for annotation in fig["layout"]["annotations"]:
        annotation["font"] = dict(size=11, color="#2d3748", family="Inter")
        annotation["y"] = annotation["y"] + 0.01

    fig.update_xaxes(
        tickangle=-45,
        tickfont=dict(size=8),
        showgrid=False,
    )
    fig.update_yaxes(
        title_text="Count",
        title_font=dict(size=9),
        range=[0, global_max * 1.1],
        showgrid=True,
        gridcolor="rgba(128, 128, 128, 0.2)",
    )

    return fig
