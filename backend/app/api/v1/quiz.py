"""Quiz generation and evaluation endpoints."""

from typing import List
from fastapi import APIRouter, Depends, Query
from app.api.deps import get_quiz_service
from app.models.schemas import ErrorDetail, QuestionPublic, QuizResult, QuizSubmission
from app.services.base import QuizService

router = APIRouter(prefix="/quiz", tags=["Quiz"])


@router.post(
    "/generate",
    response_model=List[QuestionPublic],
    status_code=200,
    responses={
        404: {"model": ErrorDetail, "description": "Topic not found"},
        422: {"description": "Validation error"},
    },
)
async def generate_quiz(
    topic_id: str = Query(..., description="Target interview track identifier"),
    service: QuizService = Depends(get_quiz_service),
) -> List[QuestionPublic]:
    """Generate or retrieve public questions for a specified interview topic."""
    return service.generate_quiz(topic_id)


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
        422: {"description": "Validation error"},
    },
)
async def evaluate_quiz(
    submission: QuizSubmission,
    service: QuizService = Depends(get_quiz_service),
) -> QuizResult:
    """Evaluate candidate quiz answers and return scored performance rubric."""
    return service.evaluate_quiz(submission)
