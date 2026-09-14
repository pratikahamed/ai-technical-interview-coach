"""Health check endpoint for pre-warming cold-start cloud containers."""

from typing import Dict
from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=Dict[str, str], status_code=200)
async def health_check() -> Dict[str, str]:
    """Pre-warm ping and uptime health verification."""
    return {"status": "healthy"}
