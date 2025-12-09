"""
Entry point for AÏLA Backend Application
This file is the standard entry point for WSGI/ASGI servers
"""

# Import the FastAPI application
from server import app

# This allows the application to be started with:
# - uvicorn app:app
# - gunicorn app:app -k uvicorn.workers.UvicornWorker
# - Any ASGI server that looks for app:app

# The app is already configured in server.py
# This file just exposes it with the standard naming convention
