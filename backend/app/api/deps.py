"""API dependency injection providers."""

from functools import lru_cache
from app.services.base import QuizService
from app.services.mock_quiz_service import MockQuizService


@lru_cache()
def get_quiz_service() -> QuizService:
    """Dependency provider returning singleton QuizService implementation."""
    return MockQuizService()
