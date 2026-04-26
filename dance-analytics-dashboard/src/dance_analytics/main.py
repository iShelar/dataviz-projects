"""Dash application entrypoint."""

from __future__ import annotations

import logging

from dash import Dash
from flask import jsonify

from dance_analytics.charts.bubble_map import load_country_coords
from dance_analytics.config import Settings, app_root, load_settings
from dance_analytics.dashboard.callbacks import register_callbacks
from dance_analytics.dashboard.layout import build_layout
from dance_analytics.data.loader import load_dataset

logger = logging.getLogger(__name__)

INDEX_STRING = """
<!DOCTYPE html>
<html>
    <head>
        {%metas%}
        <title>__PAGE_TITLE__</title>
        {%favicon%}
        {%css%}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body>
        {%app_entry%}
        <footer>
            {%config%}
            {%scripts%}
            {%renderer%}
        </footer>
    </body>
</html>
"""


def setup_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level, logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
        force=True,
    )


def _register_ops_routes(app: Dash, settings: Settings) -> None:
    @app.server.route("/health", methods=["GET"])
    def health():
        return jsonify(status="ok", service="dance-analytics")

    @app.server.route("/ready", methods=["GET"])
    def ready():
        if not settings.data_path.is_file():
            return jsonify(status="not_ready", reason="dataset_missing"), 503
        if not settings.centroids_path.is_file():
            return jsonify(status="not_ready", reason="centroids_missing"), 503
        return jsonify(
            status="ready",
            dataset=str(settings.data_path),
            centroids=str(settings.centroids_path),
        )


def create_app(settings: Settings) -> Dash:
    root = app_root()
    df = load_dataset(settings.data_path)
    country_coords = load_country_coords(settings.centroids_path)

    app = Dash(
        __name__,
        assets_folder=str(root / "assets"),
        suppress_callback_exceptions=True,
    )
    app.scripts.config.serve_locally = True
    app.css.config.serve_locally = True
    app.index_string = INDEX_STRING.replace("__PAGE_TITLE__", settings.page_title)
    app.layout = build_layout(df, country_coords)
    register_callbacks(app, df, country_coords)
    _register_ops_routes(app, settings)

    logger.info("Dash app ready (rows=%s)", len(df))
    return app


settings = load_settings()
setup_logging(settings.log_level)
app = create_app(settings)
server = app.server


def run() -> None:
    """CLI entry: `dance-dashboard` or `python -m dance_analytics.main`."""
    app.run(host=settings.host, port=settings.port, debug=settings.debug)


if __name__ == "__main__":
    run()
