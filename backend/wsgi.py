"""
WSGI entry point for AÏLA Backend Application
For use with WSGI servers like Gunicorn
"""

from server import app

# For WSGI servers
application = app

# This allows the application to be started with:
# - gunicorn wsgi:application -k uvicorn.workers.UvicornWorker
