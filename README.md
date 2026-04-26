# Data visualisation portfolio

Three self-contained visualisation projects.

**Live site:** https://ishelar.github.io/dataviz-projects/

| Project | Type | Stack | Live demo |
|---------|------|-------|-----------|
| [`dance-analytics-dashboard/`](dance-analytics-dashboard/) | Multi-view interactive dashboard | Python · Plotly Dash · Pandas · Docker | [Live on Hugging Face Spaces](https://ishelar-dance-analytics.hf.space/) |
| [`minard-d3-visualizations/`](minard-d3-visualizations/) | Browser-only D3 charts (Minard scatter + Gapminder iterations) | HTML · D3 v7 | [Minard scatter](https://ishelar.github.io/dataviz-projects/minard-d3-visualizations/minard-scatter/minard-scatter.html) · [Gapminder I](https://ishelar.github.io/dataviz-projects/minard-d3-visualizations/gapminder/First/gapminder.html) · [Gapminder II](https://ishelar.github.io/dataviz-projects/minard-d3-visualizations/gapminder/Second/gapminder.html) · [Gapminder III](https://ishelar.github.io/dataviz-projects/minard-d3-visualizations/gapminder/Third/gapminder.html) |
| [`visualisation-analysis/`](visualisation-analysis/) | Critique of three published visualisations and a design proposal | Markdown + images | viewable on GitHub |

## Overview

### 1. Dance analytics dashboard
Interactive Plotly Dash app exploring a global dance-styles dataset through linked parallel coordinates, Sankey flow, geo bubbles and time-period small multiples. Installable Python package with environment-driven config, `/health` + `/ready` endpoints, and a production `Dockerfile`. Deployed as a Docker Space on Hugging Face: **[ishelar-dance-analytics.hf.space](https://ishelar-dance-analytics.hf.space/)**.

### 2. Minard & Gapminder D3 visualisations
Static D3 charts: a scatter recreation of the data behind Minard's 1869 Napoleon march map, and three progressively richer Gapminder iterations. Pure HTML + JavaScript + CSV — no build step, no server.

### 3. Visualisation analysis & design
Munzner-framework critiques of three published visualisations ("Happy People, Happy Planet?", a Sample Superstore sales dashboard, and a Musk Tweets infographic) plus a written design proposal for the dance dataset.

## Structure

```text
dataviz-projects/
├── README.md
├── LICENSE
├── dance-analytics-dashboard/
├── minard-d3-visualizations/
└── visualisation-analysis/
```

Each subfolder has its own README with run / hosting / content details.

## License

[MIT](LICENSE) © Saurabh Shelar
