import plotly.graph_objects as go


def create_pcp(data):
    dance_types = data["Dance Type"].unique()
    color_map = {dt: i for i, dt in enumerate(dance_types)}
    colors = data["Dance Type"].map(color_map)

    fig = go.Figure(
        data=go.Parcoords(
            line=dict(
                color=colors,
                colorscale="Viridis",
                showscale=True,
                cmin=0,
                cmax=len(dance_types) - 1,
            ),
            dimensions=[
                dict(
                    label="Tempo (BPM)",
                    values=data["Tempo (BPM)"],
                    range=[data["Tempo (BPM)"].min(), data["Tempo (BPM)"].max()],
                ),
                dict(
                    label="Hardness Ratio",
                    values=data["Hardness Ratio"],
                    range=[0, data["Hardness Ratio"].max()],
                ),
                dict(
                    label="Learning Difficulty",
                    values=data["Learning_Difficulty_Numeric"],
                    range=[1, 4],
                    tickvals=[1, 2, 3, 4],
                    ticktext=["Very Easy", "Easy", "Moderate", "Hard"],
                ),
                dict(
                    label="Cultural Significance",
                    values=data["Cultural_Significance_Score"],
                    range=[0, data["Cultural_Significance_Score"].max()],
                ),
                dict(
                    label="Time Period",
                    values=data["Time_Period_Numeric"],
                    range=[1, 8],
                    tickvals=[1, 2, 3, 4, 5, 6, 7, 8],
                    ticktext=[
                        "19th",
                        "Early 20th",
                        "20th",
                        "1970s",
                        "Modern",
                        "Contemporary",
                        "21st",
                        "2020s",
                    ],
                ),
            ],
        )
    )

    fig.update_layout(
        title_text="Parallel Coordinates: Dance Characteristics",
        font_size=10,
        height=600,
        margin=dict(l=80, r=80, t=40, b=40),
    )

    return fig
