#!/bin/bash

echo "➡ Installing dependencies..."
uv sync --python 3.12

echo "➡ Starting FastAPI with Uvicorn..."
uv run --python 3.12 uvicorn app.main:app --host 0.0.0.0 --port $PORT
