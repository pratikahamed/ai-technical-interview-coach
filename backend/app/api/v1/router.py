"""Consolidated v1 API Router mounting endpoints."""

from fastapi import APIRouter

from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.quiz import router as quiz_router
from app.api.v1.endpoints.topics import router as topics_router

api_router = APIRouter()
api_router.include_router(health_router, prefix="", tags=["Health"])
api_router.include_router(topics_router, prefix="", tags=["Topics"])
api_router.include_router(quiz_router, prefix="", tags=["Quiz"])
