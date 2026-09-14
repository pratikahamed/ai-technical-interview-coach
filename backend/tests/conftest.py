"""Pytest fixtures for API testing."""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client() -> TestClient:
    """Provide a TestClient instance for route requests."""
    return TestClient(app)
