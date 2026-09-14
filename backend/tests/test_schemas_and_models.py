"""Tests for Pydantic models, schemas, and public security masking invariants."""

import pytest
from pydantic import ValidationError

from app.models.schemas import (
    ErrorDetail,
    QuestionInternal,
    QuestionPublic,
    QuestionReview,
    QuizGenerateResponse,
    QuizResult,
    QuizSubmission,
    Topic,
)


def test_question_public_secret_masking_invariant():
    """Verify that QuestionPublic schema physically lacks secret answer fields."""
    public_fields = QuestionPublic.model_fields.keys()
    assert "correct_option_index" not in public_fields
    assert "explanation" not in public_fields
    assert "id" in public_fields
    assert "topic_id" in public_fields
    assert "text" in public_fields
    assert "options" in public_fields


def test_question_internal_contains_evaluation_secrets():
    """Verify that QuestionInternal model retains evaluation ground truth."""
    internal = QuestionInternal(
        id="q-internal-01",
        topic_id="dsa",
        text="What is the average lookup complexity of a hash table?",
        options=["O(1)", "O(N)", "O(log N)", "O(N^2)"],
        seniority="senior",
        difficulty="hard",
        correct_option_index=0,
        explanation="Hash tables provide O(1) expected lookup.",
    )
    assert internal.correct_option_index == 0
    assert "O(1)" in internal.explanation


def test_quiz_generate_response_schema():
    """Verify QuizGenerateResponse contains 3 questions and optional session_id."""
    q1 = QuestionPublic(
        id="q1",
        topic_id="dsa",
        text="Question text 1",
        options=["A", "B", "C", "D"],
    )
    resp = QuizGenerateResponse(
        session_id="test-session-uuid",
        questions=[q1, q1, q1],
        seniority="senior",
        difficulty="hard",
    )
    assert resp.session_id == "test-session-uuid"
    assert len(resp.questions) == 3


def test_quiz_submission_validation():
    """Verify QuizSubmission requires topic_id and answers map."""
    # Valid submission
    sub = QuizSubmission(
        topic_id="system-design",
        session_id="sub-session-id",
        answers={"q1": 0, "q2": -1},
    )
    assert sub.topic_id == "system-design"
    assert sub.answers["q2"] == -1

    # Invalid: missing required fields
    with pytest.raises(ValidationError):
        QuizSubmission(topic_id="dsa")


def test_quiz_result_and_review_schema():
    """Verify QuizResult serializes score, total, percentage, and reviews."""
    review = QuestionReview(
        question_id="q1",
        text="Question 1",
        selected_option=0,
        correct_option=0,
        is_correct=True,
        explanation="Correct choice explanation.",
    )
    res = QuizResult(
        topic_id="dsa",
        score=1,
        total=1,
        percentage=100.0,
        reviews=[review],
    )
    assert res.score == 1
    assert res.percentage == 100.0
    assert len(res.reviews) == 1
    assert res.reviews[0].is_correct is True


def test_error_detail_schema():
    """Verify ErrorDetail schema conforms strictly to code and message."""
    err = ErrorDetail(code="VALIDATION_ERROR", message="Invalid payload.")
    assert err.code == "VALIDATION_ERROR"
    assert err.message == "Invalid payload."
