"""Quiz generation and evaluation endpoints."""

import time
from fastapi import APIRouter, Depends, Query
from app.api.deps import get_quiz_service
from app.core.exceptions import (
    InvalidDifficultyException,
    InvalidSeniorityException,
)
from app.core.logging import logger
from app.models.schemas import (
    ErrorDetail,
    QuizGenerateResponse,
    QuizResult,
    QuizSubmission,
)
from app.services.base import QuizService

router = APIRouter(prefix="/quiz", tags=["Quiz"])

VALID_SENIORITIES = {"junior", "mid", "senior"}
VALID_DIFFICULTIES = {"easy", "medium", "hard"}


@router.post(
    "/generate",
    response_model=QuizGenerateResponse,
    status_code=200,
    responses={
        404: {"model": ErrorDetail, "description": "Topic not found"},
        422: {"model": ErrorDetail, "description": "Invalid seniority or difficulty parameter"},
        502: {"model": ErrorDetail, "description": "LLM generation failure after retry"},
    },
)
async def generate_quiz(
    topic_id: str = Query(..., description="Target interview track identifier"),
    seniority: str = Query("mid", description="Target seniority tier: junior, mid, senior"),
    difficulty: str = Query("medium", description="Topic difficulty: easy, medium, hard"),
    service: QuizService = Depends(get_quiz_service),
) -> QuizGenerateResponse:
    """Generate or retrieve public questions calibrated to topic, seniority, and difficulty."""
    start_time = time.perf_counter()
    normalized_seniority = seniority.lower().strip()
    if normalized_seniority not in VALID_SENIORITIES:
        raise InvalidSeniorityException(seniority)

    normalized_difficulty = difficulty.lower().strip()
    if normalized_difficulty not in VALID_DIFFICULTIES:
        raise InvalidDifficultyException(difficulty)

    result = await service.generate_quiz(
        topic_id, seniority=normalized_seniority, difficulty=normalized_difficulty
    )
    duration_ms = (time.perf_counter() - start_time) * 1000
    logger.info(
        f"Route boundary [generate]: topic_id={topic_id}, seniority={normalized_seniority}, "
        f"difficulty={normalized_difficulty}, session_id={result.session_id}, "
        f"questions_count={len(result.questions)}, duration_ms={duration_ms:.2f}"
    )
    return result


@router.post(
    "/evaluate",
    response_model=QuizResult,
    status_code=200,
    responses={
        400: {
            "model": ErrorDetail,
            "description": "Question mismatch or invalid option index",
        },
        404: {"model": ErrorDetail, "description": "Topic not found"},
        410: {
            "model": ErrorDetail,
            "description": "Session expired or not found",
        },
        422: {"description": "Validation error"},
    },
)
async def evaluate_quiz(
    submission: QuizSubmission,
    service: QuizService = Depends(get_quiz_service),
) -> QuizResult:
    """Evaluate candidate quiz answers and return scored performance rubric."""
    start_time = time.perf_counter()
    result = await service.evaluate_quiz(submission)
    duration_ms = (time.perf_counter() - start_time) * 1000
    logger.info(
        f"Route boundary [evaluate]: topic_id={submission.topic_id}, "
        f"session_id={submission.session_id}, score={result.score}/{result.total} "
        f"({result.percentage}%), duration_ms={duration_ms:.2f}"
    )
    return result
