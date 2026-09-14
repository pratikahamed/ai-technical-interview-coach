"""Domain models and exceptions for the AI Interview Coach platform."""

from app.core.exceptions import (
    AppException,
    TopicNotFoundException,
    QuestionTopicMismatchException,
    InvalidOptionIndexException,
    InvalidSeniorityException,
    InvalidDifficultyException,
    SessionExpiredException,
    LLMGenerationFailedException,
)

__all__ = [
    "AppException",
    "TopicNotFoundException",
    "QuestionTopicMismatchException",
    "InvalidOptionIndexException",
    "InvalidSeniorityException",
    "InvalidDifficultyException",
    "SessionExpiredException",
    "LLMGenerationFailedException",
]
