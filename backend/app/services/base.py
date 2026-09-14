"""Abstract base class defining the QuizService contract."""

from abc import ABC, abstractmethod
from typing import List
from app.models.schemas import (
    QuizGenerateResponse,
    QuizResult,
    QuizSubmission,
    Topic,
)


class QuizService(ABC):
    """Abstract interface for topic retrieval, quiz generation, and evaluation."""

    @abstractmethod
    def get_topics(self) -> List[Topic]:
        """Retrieve list of available interview tracks."""
        pass

    @abstractmethod
    async def generate_quiz(
        self, topic_id: str, seniority: str = "mid", difficulty: str = "medium"
    ) -> QuizGenerateResponse:
        """Generate/fetch public questions for a given topic with answers stripped."""
        pass

    @abstractmethod
    async def evaluate_quiz(self, submission: QuizSubmission) -> QuizResult:
        """Evaluate candidate submission against ground truth and produce detailed scorecard."""
        pass
