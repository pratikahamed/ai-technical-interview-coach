"""Tests for session cache resilience: TTL eviction, asyncio.Lock concurrency, and expiration."""

import asyncio
import time
from unittest.mock import MagicMock
import pytest
from fastapi.testclient import TestClient

from app.core.exceptions import SessionExpiredException
from app.models.schemas import QuestionInternal, QuizSubmission
from app.services.llm_quiz_service import LLMQuizService


def test_session_not_found_returns_410(client: TestClient):
    """Verify evaluation with non-existent or expired session_id returns 410 SESSION_EXPIRED."""
    res = client.post(
        "/api/v1/quiz/evaluate",
        json={
            "topic_id": "dsa",
            "session_id": "00000000-0000-0000-0000-000000000000",
            "answers": {"dsa-01": 1},
        },
    )
    assert res.status_code == 410
    data = res.json()
    assert data["code"] == "SESSION_EXPIRED"
    assert "expired" in data["message"].lower() or "not found" in data["message"].lower()


@pytest.mark.anyio
async def test_lazy_ttl_eviction_purges_expired_sessions():
    """Verify that sessions older than 30 minutes (1800s) are purged on access."""
    service = LLMQuizService(client=MagicMock())

    dummy_questions = [
        QuestionInternal(
            id="q-test",
            topic_id="dsa",
            text="Test question",
            options=["A", "B", "C", "D"],
            seniority="mid",
            difficulty="medium",
            correct_option_index=0,
            explanation="Explanation",
        )
    ]

    now = time.time()
    # 1. Add expired session (31 minutes old)
    expired_sid = "expired-sid-1"
    service._sessions[expired_sid] = (now - 1860, dummy_questions)

    # 2. Add fresh session (5 minutes old)
    fresh_sid = "fresh-sid-2"
    service._sessions[fresh_sid] = (now - 300, dummy_questions)

    # Trigger eviction
    service._evict_expired_sessions()

    assert expired_sid not in service._sessions
    assert fresh_sid in service._sessions

    # Attempting to evaluate with expired_sid raises SessionExpiredException
    submission = QuizSubmission(
        topic_id="dsa",
        session_id=expired_sid,
        answers={"q-test": 0},
    )
    with pytest.raises(SessionExpiredException):
        await service.evaluate_quiz(submission)


@pytest.mark.anyio
async def test_session_cache_asyncio_lock_concurrency():
    """Verify concurrent reads/writes on LLMQuizService session cache safely coordinate under lock."""
    service = LLMQuizService(client=MagicMock())

    async def register_session(idx: int):
        dummy_q = [
            QuestionInternal(
                id=f"q-{idx}",
                topic_id="dsa",
                text=f"Question {idx}",
                options=["A", "B", "C", "D"],
                seniority="mid",
                difficulty="medium",
                correct_option_index=0,
                explanation="Explanation",
            )
        ]
        sid = f"sid-{idx}"
        async with service._get_lock():
            service._evict_expired_sessions()
            service._sessions[sid] = (time.time(), dummy_q)
        return sid

    # Run 20 concurrent session registrations
    tasks = [register_session(i) for i in range(20)]
    sids = await asyncio.gather(*tasks)

    assert len(sids) == 20
    assert len(service._sessions) == 20
    for sid in sids:
        assert sid in service._sessions
