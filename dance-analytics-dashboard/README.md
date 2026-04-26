# Dance styles analytics dashboard

Multi-linked **Plotly Dash** dashboard for exploring a global dance-styles dataset: parallel coordinates, Sankey flow, geo bubbles, and time-period small multiples. Built as a small, installable Python package with health checks and environment-based configuration.

**Live demo:** [ishelar-dance-analytics.hf.space](https://ishelar-dance-analytics.hf.space/) · **Space:** [huggingface.co/spaces/ishelar/dance-analytics](https://huggingface.co/spaces/ishelar/dance-analytics)

## Problem

Researchers and enthusiasts comparing traditions need **linked views** (filter in one chart, see the effect elsewhere) without juggling separate tools. This app wires PCP brushing and Sankey clicks into consistent cohorts and map context.

## Features

- Linked filtering: parallel-coordinates ranges and Sankey node clicks narrow Sankey + PCP
- Geo bubble map with country focus dropdown
- Small multiples by coarse time-period group
- Print-oriented layout (A4 landscape CSS in `assets/custom.css`)
- **`GET /health`** — liveness
- **`GET /ready`** — dataset and centroids files on disk

## Tech stack

- Python 3.11+
- Dash, Plotly, Pandas, NumPy
- Gunicorn (production WSGI)
- python-dotenv (optional local `.env`)

## Quick start (local)

From this directory (`dance-analytics-dashboard/`):

```bash
python3.11 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -U pip
pip install -e ".[dev]"
cp .env.example .env          # optional; defaults match repo layout
pytest
dance-dashboard               # or: python -m dance_analytics.main
```

Open **http://127.0.0.1:8051** (or the `PORT` you set).

### Sanity checks without opening the browser

```bash
curl -s http://127.0.0.1:8051/health
curl -s http://127.0.0.1:8051/ready
```

## Configuration

| Variable | Purpose |
|----------|---------|
| `DANCE_ANALYTICS_DATA_PATH` | CSV path (absolute or relative to app root) |
| `DANCE_ANALYTICS_CENTROIDS_PATH` | JSON map of country → `[lat, lon]` |
| `HOST` / `PORT` / `DEBUG` | Dev server binding |
| `LOG_LEVEL` | Python logging level (`INFO`, `DEBUG`, …) |
| `DANCE_ANALYTICS_PAGE_TITLE` | Browser tab title |

See **`.env.example`**.

## Production-style run (Gunicorn)

After `pip install -e .` from this directory:

```bash
gunicorn "dance_analytics.main:server" -b 0.0.0.0:8051 --workers 2
```

## Run with Docker

```bash
docker build -t dance-analytics .
docker run -p 7860:7860 dance-analytics
# open http://127.0.0.1:7860
```

The same `Dockerfile` is what powers the live Hugging Face Space — non-root `uid 1000`, port `7860`, gunicorn (2 workers), `HEALTHCHECK` on `/health`.

## Project layout

```text
dance-analytics-dashboard/
  Dockerfile             # Hugging Face / generic container build
  .dockerignore
  pyproject.toml
  README.md
  .env.example
  data/
    original_dance_dataset.csv
    country_centroids.json
  assets/
    custom.css
  src/dance_analytics/
    main.py              # app factory + /health + /ready
    config.py
    data/                # load + schema + transforms
    charts/              # figure builders
    dashboard/           # layout + callbacks + shared layout constants
  tests/
```

## Example usage

1. Start the app (`dance-dashboard`).
2. Drag ranges on the **parallel coordinates** plot — Sankey and PCP update to the filtered subset.
3. Click a **Sankey** node — same behaviour.
4. Pick a country in the map card dropdown — map zooms to stored centroids.

## Roadmap

- Row-level schema validation (e.g. pydantic or pandera)
- Precomputed aggregates for very large CSVs
- Centroids from a maintained geo dataset instead of static JSON
- CI: build the Docker image on every push and smoke-test `/ready` before deploy

## License

MIT — see `LICENSE`.

---

**Resume one-liner:** Python/Dash analytics dashboard with linked cross-filtering, geospatial aggregation, health/readiness endpoints, and env-driven configuration suitable for portfolio demos.
