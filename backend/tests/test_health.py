"""Tests for health check endpoints."""

from fastapi.testclient import TestClient


def test_root_health_check(client: TestClient):
    """Verify root GET /health returns 200 and healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data == {"status": "healthy"}


def test_versioned_health_check(client: TestClient):
    """Verify versioned GET /api/v1/health returns 200 and healthy status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data == {"status": "healthy"}
