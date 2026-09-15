"""Comprehensive integration tests for all REST API endpoints."""

from fastapi.testclient import TestClient


# ------------------------------------------------------------------------------
# Health Checks
# ------------------------------------------------------------------------------
def test_root_probe_check(client: TestClient):
    """Verify root GET / returns 200 with service identity and healthy status."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "AI Technical Interview Coach API" in data["service"]


def test_root_health_check(client: TestClient):
    """Verify root GET /health returns 200 and healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_versioned_health_check(client: TestClient):
    """Verify versioned GET /api/v1/health returns 200 and healthy status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


# ------------------------------------------------------------------------------
# Topics
# ------------------------------------------------------------------------------
def test_list_topics(client: TestClient):
    """Verify GET /api/v1/topics returns the 5 predefined engineering tracks."""
    response = client.get("/api/v1/topics")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 5

    expected_ids = {"dsa", "system-design", "lld", "java", "spring"}
    received_ids = {t["id"] for t in data}
    assert received_ids == expected_ids

    for topic in data:
        assert "id" in topic
        assert "name" in topic
        assert "description" in topic
        assert len(topic["description"]) > 10


# ------------------------------------------------------------------------------
# Quiz Generation Endpoint
# ------------------------------------------------------------------------------
def test_generate_quiz_success(client: TestClient):
    """Verify POST /api/v1/quiz/generate returns QuizGenerateResponse with 3 public questions."""
    response = client.post("/api/v1/quiz/generate?topic_id=dsa&seniority=senior&difficulty=hard")
    assert response.status_code == 200
    data = response.json()
    assert "questions" in data
    assert data["seniority"] == "senior"
    assert data["difficulty"] == "hard"

    questions = data["questions"]
    assert isinstance(questions, list)
    assert len(questions) == 3

    for q in questions:
        assert q["topic_id"] == "dsa"
        assert "id" in q
        assert "text" in q
        assert "options" in q
        assert len(q["options"]) == 4


def test_generate_quiz_secrets_not_leaked(client: TestClient):
    """Verify public questions in QuizGenerateResponse NEVER leak answers or explanations."""
    response = client.post("/api/v1/quiz/generate?topic_id=dsa")
    assert response.status_code == 200
    data = response.json()
    questions = data["questions"]

    for q in questions:
        assert "correct_option_index" not in q
        assert "explanation" not in q


def test_generate_quiz_topic_not_found(client: TestClient):
    """Verify generating quiz for unknown topic returns 404 with ErrorDetail."""
    response = client.post("/api/v1/quiz/generate?topic_id=quantum-computing")
    assert response.status_code == 404
    error = response.json()
    assert error["code"] == "TOPIC_NOT_FOUND"
    assert "quantum-computing" in error["message"]


def test_generate_quiz_invalid_seniority(client: TestClient):
    """Verify invalid seniority parameter returns 422 with INVALID_SENIORITY code."""
    response = client.post("/api/v1/quiz/generate?topic_id=dsa&seniority=grandmaster")
    assert response.status_code == 422
    error = response.json()
    assert error["code"] == "INVALID_SENIORITY"
    assert "grandmaster" in error["message"]


def test_generate_quiz_invalid_difficulty(client: TestClient):
    """Verify invalid difficulty parameter returns 422 with INVALID_DIFFICULTY code."""
    response = client.post("/api/v1/quiz/generate?topic_id=dsa&difficulty=impossible")
    assert response.status_code == 422
    error = response.json()
    assert error["code"] == "INVALID_DIFFICULTY"
    assert "impossible" in error["message"]


# ------------------------------------------------------------------------------
# Quiz Evaluation Endpoint
# ------------------------------------------------------------------------------
def test_evaluate_quiz_perfect_score(client: TestClient):
    """Verify evaluation yields 100% when all answers are correct."""
    submission_payload = {
        "topic_id": "dsa",
        "answers": {
            "dsa-01": 1,
            "dsa-02": 2,
            "dsa-03": 1,
        },
    }
    response = client.post("/api/v1/quiz/evaluate", json=submission_payload)
    assert response.status_code == 200
    result = response.json()

    assert result["topic_id"] == "dsa"
    assert result["score"] == 3
    assert result["total"] == 3
    assert result["percentage"] == 100.0
    assert len(result["reviews"]) == 3

    for review in result["reviews"]:
        assert review["is_correct"] is True
        assert review["selected_option"] == review["correct_option"]
        assert len(review["explanation"]) > 0


def test_evaluate_quiz_partial_score(client: TestClient):
    """Verify evaluation correctly computes score and reviews on wrong answers."""
    submission_payload = {
        "topic_id": "dsa",
        "answers": {
            "dsa-01": 1,  # Correct
            "dsa-02": 0,  # Wrong (correct is 2)
            "dsa-03": 0,  # Wrong (correct is 1)
        },
    }
    response = client.post("/api/v1/quiz/evaluate", json=submission_payload)
    assert response.status_code == 200
    result = response.json()

    assert result["topic_id"] == "dsa"
    assert result["score"] == 1
    assert result["total"] == 3
    assert result["percentage"] == 33.3

    reviews_by_id = {r["question_id"]: r for r in result["reviews"]}
    assert reviews_by_id["dsa-01"]["is_correct"] is True
    assert reviews_by_id["dsa-02"]["is_correct"] is False
    assert reviews_by_id["dsa-02"]["selected_option"] == 0
    assert reviews_by_id["dsa-02"]["correct_option"] == 2
    assert reviews_by_id["dsa-03"]["is_correct"] is False


def test_evaluate_quiz_with_skipped_questions(client: TestClient):
    """Verify candidate can skip questions (-1) and receive full summary and explanations."""
    submission_payload = {
        "topic_id": "dsa",
        "answers": {
            "dsa-01": 1,   # Answered correctly
            "dsa-02": -1,  # Skipped
            "dsa-03": -1,  # Skipped
        },
    }
    response = client.post("/api/v1/quiz/evaluate", json=submission_payload)
    assert response.status_code == 200
    result = response.json()

    assert result["score"] == 1
    assert result["total"] == 3
    assert result["percentage"] == 33.3

    reviews_by_id = {r["question_id"]: r for r in result["reviews"]}
    assert reviews_by_id["dsa-01"]["is_correct"] is True
    assert reviews_by_id["dsa-02"]["is_correct"] is False
    assert reviews_by_id["dsa-02"]["selected_option"] == -1
    assert len(reviews_by_id["dsa-02"]["explanation"]) > 0


def test_evaluate_quiz_skip_all_questions(client: TestClient):
    """Verify that skipping ALL questions generates complete scorecard and review diagnostics."""
    submission_payload = {
        "topic_id": "dsa",
        "answers": {
            "dsa-01": -1,
            "dsa-02": -1,
            "dsa-03": -1,
        },
    }
    response = client.post("/api/v1/quiz/evaluate", json=submission_payload)
    assert response.status_code == 200
    result = response.json()

    assert result["score"] == 0
    assert result["total"] == 3
    assert result["percentage"] == 0.0
    assert len(result["reviews"]) == 3

    for rev in result["reviews"]:
        assert rev["is_correct"] is False
        assert rev["selected_option"] == -1
        assert len(rev["explanation"]) > 0


def test_evaluate_quiz_unknown_topic(client: TestClient):
    """Verify evaluation with non-existent topic returns 404 ErrorDetail."""
    submission_payload = {
        "topic_id": "non-existent-topic",
        "answers": {"dsa-01": 1},
    }
    response = client.post("/api/v1/quiz/evaluate", json=submission_payload)
    assert response.status_code == 404
    error = response.json()
    assert error["code"] == "TOPIC_NOT_FOUND"


def test_evaluate_quiz_question_topic_mismatch(client: TestClient):
    """Verify answering a question belonging to another topic returns 400."""
    submission_payload = {
        "topic_id": "dsa",
        "answers": {
            "dsa-01": 1,
            "sys-01": 1,  # Belongs to system-design, not dsa
        },
    }
    response = client.post("/api/v1/quiz/evaluate", json=submission_payload)
    assert response.status_code == 400
    error = response.json()
    assert error["code"] == "QUESTION_TOPIC_MISMATCH"
    assert "sys-01" in error["message"]


def test_evaluate_quiz_invalid_option_index(client: TestClient):
    """Verify submitting an out-of-bounds option index returns 400."""
    submission_payload = {
        "topic_id": "dsa",
        "answers": {
            "dsa-01": 99,  # Valid indices are 0..3 (or -1 for skip)
        },
    }
    response = client.post("/api/v1/quiz/evaluate", json=submission_payload)
    assert response.status_code == 400
    error = response.json()
    assert error["code"] == "INVALID_OPTION_INDEX"
    assert "99" in error["message"]


def test_evaluate_quiz_schema_validation_error(client: TestClient):
    """Verify malformed JSON payload returns 422 with typed ErrorDetail."""
    # Missing required field "answers"
    malformed_payload = {"topic_id": "dsa"}
    response = client.post("/api/v1/quiz/evaluate", json=malformed_payload)
    assert response.status_code == 422
    error = response.json()
    assert error["code"] == "VALIDATION_ERROR"
    assert "answers" in error["message"]
