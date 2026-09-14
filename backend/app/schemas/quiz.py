"""Pydantic v2 schemas defining API contracts and domain models."""

from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field

Seniority = Literal["junior", "mid", "senior"]
Difficulty = Literal["easy", "medium", "hard"]


class Topic(BaseModel):
    """Assessment track domain metadata."""

    id: str = Field(..., description="Unique track identifier, e.g. 'dsa'")
    name: str = Field(..., description="Display name of the track")
    icon: str = Field(..., description="Icon identifier for frontend rendering")
    description: str = Field(..., description="Technical track scope description")

    model_config = ConfigDict(frozen=True)


class QuestionPublic(BaseModel):
    """Client-facing question model with answer secrets stripped."""

    id: str = Field(..., description="Unique scenario question identifier")
    topic_id: str = Field(..., description="Parent topic identifier")
    text: str = Field(..., description="Scenario prompt statement")
    options: List[str] = Field(..., description="List of possible answer choices")
    seniority: Optional[str] = Field("mid", description="Target seniority level")
    difficulty: Optional[str] = Field("medium", description="Question difficulty rating")

    model_config = ConfigDict(frozen=True)


class QuestionInternal(QuestionPublic):
    """Internal server-side representation containing evaluation ground truth."""

    correct_option_index: int = Field(
        ..., description="Zero-based index of the correct option"
    )
    explanation: str = Field(
        ..., description="Technical rationale and invariant proof"
    )


class QuizGenerateResponse(BaseModel):
    """Envelope containing masked public questions and session correlation ID."""

    session_id: Optional[str] = Field(
        None, description="Session UUID for server-side evaluation lookup"
    )
    questions: List[QuestionPublic] = Field(
        ..., description="Public question list with secrets masked"
    )
    seniority: str = Field("mid", description="Calibrated seniority level")
    difficulty: str = Field("medium", description="Calibrated difficulty level")

    model_config = ConfigDict(frozen=True)


class QuizSubmission(BaseModel):
    """Candidate submission payload for server-side evaluation."""

    topic_id: str = Field(..., description="Topic identifier being evaluated")
    answers: Dict[str, int] = Field(
        ..., description="Mapping of question_id -> selected_option_index (-1 for skipped)"
    )
    session_id: Optional[str] = Field(
        None, description="Optional session UUID for dynamic question grading"
    )


class QuestionReview(BaseModel):
    """Itemized evaluation diagnostic for an individual question."""

    question_id: str = Field(..., description="Question identifier")
    text: str = Field(..., description="Question prompt statement")
    selected_option: int = Field(
        ..., description="Index selected by candidate (-1 if skipped)"
    )
    correct_option: int = Field(..., description="Zero-based correct answer index")
    is_correct: bool = Field(..., description="True if selected matches correct")
    explanation: str = Field(
        ..., description="Detailed architectural rationale and invariant proof"
    )

    model_config = ConfigDict(frozen=True)


class QuizResult(BaseModel):
    """Aggregated evaluation scorecard and diagnostic breakdown."""

    topic_id: str = Field(..., description="Evaluated topic identifier")
    score: int = Field(..., description="Count of correctly answered questions")
    total: int = Field(..., description="Total questions evaluated")
    percentage: float = Field(
        ..., description="Calculated score percentage (0.0 to 100.0)"
    )
    reviews: List[QuestionReview] = Field(
        ..., description="Per-question evaluation breakdown"
    )

    model_config = ConfigDict(frozen=True)


class ErrorDetail(BaseModel):
    """Standardized typed error response model."""

    code: str = Field(..., description="Machine-readable uppercase error code")
    message: str = Field(..., description="Human-readable explanation of the error")

    model_config = ConfigDict(frozen=True)
