#!/usr/bin/env python3
"""
Main entry point for AÏLA Backend Application
This file ensures the application starts correctly in production environments
"""

import sys
import logging
import traceback

# Configure logging before any imports
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.StreamHandler(sys.stderr)
    ]
)
logger = logging.getLogger(__name__)

def main():
    """Main entry point with error handling"""
    try:
        logger.info("=" * 80)
        logger.info("STARTING AÏLA BACKEND APPLICATION")
        logger.info("=" * 80)
        
        # Import the FastAPI app
        logger.info("Importing server module...")
        from server import app
        logger.info("✓ Server module imported successfully")
        
        # Import uvicorn
        logger.info("Importing uvicorn...")
        import uvicorn
        logger.info("✓ Uvicorn imported successfully")
        
        # Get configuration from environment
        import os
        host = os.environ.get('HOST', '0.0.0.0')
        port = int(os.environ.get('PORT', '8001'))
        workers = int(os.environ.get('WORKERS', '1'))
        
        logger.info(f"Configuration: host={host}, port={port}, workers={workers}")
        logger.info("=" * 80)
        
        # Start the server
        logger.info("Starting uvicorn server...")
        uvicorn.run(
            "server:app",
            host=host,
            port=port,
            log_level="info",
            access_log=True,
            workers=workers
        )
        
    except ImportError as e:
        logger.error("=" * 80)
        logger.error("IMPORT ERROR")
        logger.error("=" * 80)
        logger.error(f"Failed to import required modules: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        logger.error("=" * 80)
        sys.exit(1)
        
    except Exception as e:
        logger.error("=" * 80)
        logger.error("STARTUP ERROR")
        logger.error("=" * 80)
        logger.error(f"Failed to start application: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        logger.error("=" * 80)
        sys.exit(1)

if __name__ == "__main__":
    main()
