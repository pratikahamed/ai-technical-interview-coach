"""Structured logging configuration for standard stdout output."""

import logging
import sys
from app.core.config import settings

# Configure root logger with standard format
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger("interview_coach")
