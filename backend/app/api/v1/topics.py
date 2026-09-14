"""Topic and track retrieval endpoints."""

from typing import List
from fastapi import APIRouter, Depends
from app.api.deps import get_quiz_service
from app.models.schemas import Topic
from app.services.base import QuizService

router = APIRouter(prefix="/topics", tags=["Topics"])


@router.get("", response_model=List[Topic], status_code=200)
async def list_topics(
    service: QuizService = Depends(get_quiz_service),
) -> List[Topic]:
    """Retrieve all available mock interview domain tracks."""
    return service.get_topics()
