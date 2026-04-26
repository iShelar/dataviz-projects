# Hugging Face Space (Docker SDK) image for the Dance Analytics dashboard.
# Also runs locally with: docker build -t dance-analytics . && docker run -p 7860:7860 dance-analytics
#
# Notes:
# - Hugging Face requires the app to listen on port 7860 and run as a non-root user (uid 1000).
# - We use an editable install so `dance_analytics.config.app_root()` (which walks up from
#   __file__) resolves to /app, matching the runtime layout of `data/` and `assets/`.

FROM python:3.11-slim

RUN useradd -m -u 1000 user

ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    HOST=0.0.0.0 \
    PORT=7860 \
    DEBUG=false \
    LOG_LEVEL=INFO

WORKDIR /app

COPY --chown=user:user pyproject.toml /app/pyproject.toml
COPY --chown=user:user src /app/src

USER user

RUN pip install --user --no-cache-dir -e .

COPY --chown=user:user data /app/data
COPY --chown=user:user assets /app/assets

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:7860/health', timeout=3)" || exit 1

CMD ["gunicorn", "dance_analytics.main:server", \
     "--bind", "0.0.0.0:7860", \
     "--workers", "2", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
