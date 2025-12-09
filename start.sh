#!/bin/bash
set -e

echo "=========================================="
echo "AÏLA APPLICATION STARTUP SCRIPT"
echo "=========================================="

# Print environment info
echo "Current directory: $(pwd)"
echo "Python version: $(python3 --version)"
echo "Uvicorn version: $(python3 -c 'import uvicorn; print(uvicorn.__version__)' 2>/dev/null || echo 'not found')"

# Navigate to backend directory
cd /app/backend

echo "Backend directory contents:"
ls -la

# Set default environment variables if not set
export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-8001}"
export WORKERS="${WORKERS:-1}"

echo "Configuration:"
echo "  HOST: $HOST"
echo "  PORT: $PORT"
echo "  WORKERS: $WORKERS"
echo "=========================================="

# Start the application
echo "Starting uvicorn server..."
exec python3 -m uvicorn app:app --host "$HOST" --port "$PORT" --log-level info
