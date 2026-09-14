"""Tests for topic retrieval endpoints."""

from fastapi.testclient import TestClient


def test_list_topics(client: TestClient):
    """Verify GET /api/v1/topics returns all 5 calibrated tracks."""
    response = client.get("/api/v1/topics")
    assert response.status_code == 200
    topics = response.json()
    assert isinstance(topics, list)
    assert len(topics) == 5

    topic_ids = [t["id"] for t in topics]
    assert "dsa" in topic_ids
    assert "system-design" in topic_ids
    assert "lld" in topic_ids
    assert "java" in topic_ids
    assert "spring" in topic_ids

    # Validate structure of each topic item
    for topic in topics:
        assert "id" in topic
        assert "name" in topic
        assert "icon" in topic
        assert "description" in topic
        assert len(topic["name"]) > 0
