"""API dependency injection providers."""

from functools import lru_cache
from app.core.config import settings
from app.core.logging import logger
from app.services.base import QuizService
from app.services.llm_quiz_service import LLMQuizService
from app.services.mock_quiz_service import MockQuizService


@lru_cache()
def get_quiz_service() -> QuizService:
    """Dependency provider returning singleton QuizService implementation."""
    provider = settings.QUIZ_PROVIDER.lower().strip()

    if provider == "groq":
        if not settings.GROQ_API_KEY:
            logger.warning(
                "QUIZ_PROVIDER is set to 'groq' but GROQ_API_KEY is missing or empty. "
                "Falling back gracefully to MockQuizService."
            )
            return MockQuizService()
        logger.info(f"Initializing LLMQuizService with Groq model '{settings.GROQ_MODEL}'.")
        return LLMQuizService()

    logger.info("Initializing deterministic MockQuizService.")
    return MockQuizService()
