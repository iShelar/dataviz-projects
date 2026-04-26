# Data visualisation portfolio

Three self-contained visualisation projects.

| Project | Type | Stack | Live demo path |
|---------|------|-------|----------------|
| [`dance-analytics-dashboard/`](dance-analytics-dashboard/) | Multi-view interactive dashboard | Python · Plotly Dash · Pandas | hosted Python service (Render / Hugging Face Spaces) |
| [`minard-d3-visualizations/`](minard-d3-visualizations/) | Browser-only D3 charts (Minard scatter + Gapminder iterations) | HTML · D3 v7 | static hosting (GitHub Pages) |
| [`visualisation-analysis/`](visualisation-analysis/) | Critique of three published visualisations and a design proposal | Markdown + images | viewable on GitHub |

## Overview

### 1. Dance analytics dashboard
Interactive Plotly Dash app exploring a global dance-styles dataset through linked parallel coordinates, Sankey flow, geo bubbles and time-period small multiples. Installable Python package with environment-driven config and `/health` + `/ready` endpoints.

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
