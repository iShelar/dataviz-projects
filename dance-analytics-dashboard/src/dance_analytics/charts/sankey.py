import plotly.graph_objects as go


def create_sankey(data):
    stages = ["Dance Type", "Origin", "Age Group", "Learning Difficulty"]

    labels = []
    for col in stages:
        labels.extend(data[col].astype(str).unique())

    labels = list(dict.fromkeys(labels))
    label_to_idx = {label: i for i, label in enumerate(labels)}

    sources = []
    targets = []
    values = []
    hover_texts = []

    for i in range(len(stages) - 1):
        left = stages[i]
        right = stages[i + 1]

        grouped = data.groupby([left, right])

        for (lv, rv), group in grouped:
            sources.append(label_to_idx[str(lv)])
            targets.append(label_to_idx[str(rv)])
            values.append(len(group))

            avg_tempo = group["Tempo (BPM)"].mean()
            avg_hard = group["Hardness Ratio"].mean()
            example_styles = ", ".join(group["Dance style"].head(3).astype(str).tolist())
            hover_texts.append(
                f"{left}: {lv}<br>{right}: {rv}<br>"
                f"Dances: {len(group)}<br>"
                f"Avg Tempo: {avg_tempo:.1f} BPM<br>"
                f"Avg Hardness: {avg_hard:.2f}<br>"
                f"Examples: {example_styles}"
            )

    fig = go.Figure(
        data=[
            go.Sankey(
                node=dict(pad=15, thickness=18, line=dict(width=0.5), label=labels),
                link=dict(
                    source=sources,
                    target=targets,
                    value=values,
                    hovertemplate="%{customdata}<extra></extra>",
                    customdata=hover_texts,
                ),
            )
        ]
    )

    fig.update_layout(
        title_text="Dance Flow: Type → Origin → Age Group → Learning Difficulty",
        font_size=10,
        height=550,
        margin=dict(t=40, b=20, l=20, r=20),
    )

    return fig
