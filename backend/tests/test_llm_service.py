"""Unit and integration tests for LLMQuizService and Groq dynamic generation."""

import json
from unittest.mock import MagicMock
import pytest
from app.core.config import settings
from app.core.exceptions import (
    LLMGenerationFailedException,
    TopicNotFoundException,
)
from app.models.schemas import QuizSubmission
from app.services.llm_quiz_service import LLMQuizService


def create_mock_groq_completion(content_dict: dict):
    """Helper creating a mock Groq ChatCompletion object."""
    mock_choice = MagicMock()
    mock_choice.message.content = json.dumps(content_dict)
    mock_completion = MagicMock()
    mock_completion.choices = [mock_choice]
    return mock_completion


@pytest.fixture
def mock_valid_questions_dict():
    """Valid 3-question MCQ payload matching LLM output schema."""
    return {
        "questions": [
            {
                "id": "q1",
                "text": "What is the time complexity of lookup in a hash map?",
                "options": ["O(1) average", "O(N) always", "O(log N)", "O(N^2)"],
                "correct_option_index": 0,
                "explanation": "Hash tables provide O(1) expected lookup under uniform hashing.",
            },
            {
                "id": "q2",
                "text": "Which algorithm finds shortest path with negative edge weights without negative cycles?",
                "options": ["Dijkstra", "Bellman-Ford", "Prim", "Kruskal"],
                "correct_option_index": 1,
                "explanation": "Bellman-Ford handles negative weights and detects negative cycles.",
            },
            {
                "id": "q3",
                "text": "What property characterizes a B+ tree compared to a standard B-tree?",
                "options": [
                    "All keys stored exclusively in leaf nodes",
                    "No balancing rotations",
                    "Binary branching factor",
                    "Unsorted leaves",
                ],
                "correct_option_index": 0,
                "explanation": "B+ trees store all records in leaf nodes linked sequentially for range queries.",
            },
        ]
    }


def test_llm_service_prompt_calibration():
    """Verify prompt builder embeds targeted seniority tier and difficulty guidelines."""
    service = LLMQuizService(client=MagicMock())

    # Junior + Easy
    prompt_jr = service._build_system_prompt("dsa", "junior", "easy")
    assert "JUNIOR LEVEL (0-2 years experience)" in prompt_jr
    assert "EASY COMPLEXITY" in prompt_jr

    # Mid + Medium
    prompt_mid = service._build_system_prompt("system-design", "mid", "medium")
    assert "MID-LEVEL (3-5 years experience)" in prompt_mid
    assert "MEDIUM COMPLEXITY" in prompt_mid

    # Senior + Hard
    prompt_sr = service._build_system_prompt("lld", "senior", "hard")
    assert "SENIOR / STAFF LEVEL (5+ years experience)" in prompt_sr
    assert "HARD COMPLEXITY" in prompt_sr


@pytest.mark.anyio
async def test_llm_generate_quiz_success(mock_valid_questions_dict):
    """Verify successful dynamic question generation and answer masking."""
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = create_mock_groq_completion(
        mock_valid_questions_dict
    )

    service = LLMQuizService(client=mock_client)
    res = await service.generate_quiz("dsa", seniority="senior", difficulty="hard")

    assert res.session_id is not None
    assert len(res.questions) == 3
    assert res.seniority == "senior"
    assert res.difficulty == "hard"

    # Verify secrets are stripped from public questions
    for q in res.questions:
        assert hasattr(q, "correct_option_index") is False or "correct_option_index" not in q.model_fields_set
        assert not hasattr(q, "explanation") or "explanation" not in q.model_fields_set
        assert len(q.options) == 4


@pytest.mark.anyio
async def test_llm_generate_quiz_retry_on_first_failure(mock_valid_questions_dict):
    """Verify service retries once if first Groq completion fails and succeeds on 2nd attempt."""
    mock_client = MagicMock()
    mock_client.chat.completions.create.side_effect = [
        Exception("Transient network timeout"),
        create_mock_groq_completion(mock_valid_questions_dict),
    ]

    service = LLMQuizService(client=mock_client)
    res = await service.generate_quiz("system-design", seniority="mid", difficulty="medium")

    assert res.session_id is not None
    assert len(res.questions) == 3
    assert mock_client.chat.completions.create.call_count == 2


@pytest.mark.anyio
async def test_llm_generate_quiz_exhausted_retries_raises_502():
    """Verify that if both attempts fail, LLMGenerationFailedException is raised."""
    mock_client = MagicMock()
    mock_client.chat.completions.create.side_effect = [
        Exception("API Error 1"),
        Exception("API Error 2"),
    ]

    service = LLMQuizService(client=mock_client)
    with pytest.raises(LLMGenerationFailedException) as exc_info:
        await service.generate_quiz("dsa", seniority="senior", difficulty="hard")

    assert exc_info.value.status_code == 502
    assert exc_info.value.code == "LLM_GENERATION_FAILED"


@pytest.mark.anyio
async def test_llm_evaluate_session_success(mock_valid_questions_dict):
    """Verify server-side evaluation against dynamic session ground truth."""
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = create_mock_groq_completion(
        mock_valid_questions_dict
    )

    service = LLMQuizService(client=mock_client)
    gen_res = await service.generate_quiz("dsa", seniority="mid", difficulty="medium")
    session_id = gen_res.session_id

    q1, q2, q3 = gen_res.questions[0].id, gen_res.questions[1].id, gen_res.questions[2].id

    submission = QuizSubmission(
        topic_id="dsa",
        session_id=session_id,
        answers={
            q1: 0,   # Correct
            q2: 3,   # Wrong (correct is 1)
            q3: -1,  # Skipped
        },
    )

    result = await service.evaluate_quiz(submission)
    assert result.score == 1
    assert result.total == 3
    assert result.percentage == 33.3
    assert len(result.reviews) == 3

    reviews_by_id = {r.question_id: r for r in result.reviews}
    assert reviews_by_id[q1].is_correct is True
    assert reviews_by_id[q2].is_correct is False
    assert reviews_by_id[q3].is_correct is False
    assert reviews_by_id[q3].selected_option == -1
    assert len(reviews_by_id[q3].explanation) > 0


@pytest.mark.anyio
async def test_llm_evaluate_fallback_to_mock_when_no_session_id():
    """Verify that omitting session_id delegates cleanly to MockQuizService."""
    service = LLMQuizService(client=MagicMock())
    submission = QuizSubmission(
        topic_id="dsa",
        answers={"dsa-01": 1, "dsa-02": 2, "dsa-03": 1},
    )
    result = await service.evaluate_quiz(submission)
    assert result.score == 3
    assert result.percentage == 100.0


@pytest.mark.anyio
async def test_llm_generate_unknown_topic():
    """Verify generating for non-existent topic raises 404 TopicNotFoundException."""
    service = LLMQuizService(client=MagicMock())
    with pytest.raises(TopicNotFoundException):
        await service.generate_quiz("non-existent-track")


# ------------------------------------------------------------------------------
# Live Groq API Tests (executed when GROQ_API_KEY is configured)
# ------------------------------------------------------------------------------
@pytest.mark.anyio
async def test_live_groq_junior_easy_generation():
    """Verify live Groq generation for Junior / Easy calibration on 'java' track."""
    if not settings.GROQ_API_KEY:
        pytest.skip("GROQ_API_KEY not configured")

    live_service = LLMQuizService()
    res = await live_service.generate_quiz("java", seniority="junior", difficulty="easy")

    assert res.session_id is not None
    assert len(res.questions) == 3
    assert res.seniority == "junior"
    assert res.difficulty == "easy"

    for q in res.questions:
        assert q.topic_id == "java"
        assert len(q.options) == 4
        assert len(q.text) > 10
        assert not hasattr(q, "correct_option_index") or "correct_option_index" not in q.model_fields_set
        assert not hasattr(q, "explanation") or "explanation" not in q.model_fields_set
