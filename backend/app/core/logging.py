import logging
import logging.handlers
import os
from pathlib import Path
from app.core.config import settings


def setup_logging():
    """Configure logging with file rotation and console output."""

    # Create logs directory
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    # Root logger config
    root_logger = logging.getLogger()
    root_logger.setLevel(settings.log_level)

    # Remove existing handlers to avoid duplicates
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Format
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # File handler with rotation (10MB max per file, 5 files backup)
    file_handler = logging.handlers.RotatingFileHandler(
        log_dir / "chatbot.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)

    # Console handler (only if DEBUG or explicitly enabled)
    if settings.log_level == logging.DEBUG or settings.log_to_console:
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)

    # App-specific logger
    app_logger = logging.getLogger("chatbot")
    app_logger.setLevel(settings.log_level)

    return app_logger


# Global logger instance
logger = None


def get_logger(name: str = "chatbot") -> logging.Logger:
    """Get or create logger instance."""
    global logger
    if logger is None:
        logger = setup_logging()
    return logging.getLogger(name)
