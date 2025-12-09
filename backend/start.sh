#!/bin/bash
set -e

echo "=========================================="
echo "AÏLA BACKEND STARTUP SCRIPT"
echo "=========================================="

# Set default environment variables
export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-8001}"

echo "Starting from: $(pwd)"
echo "Configuration: $HOST:$PORT"
echo "=========================================="

# Start the application with uvicorn module
exec python3 -m uvicorn app:app --host "$HOST" --port "$PORT" --log-level info
