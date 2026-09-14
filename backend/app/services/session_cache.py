"""Thread-safe in-memory session cache with lazy TTL expiration."""

import asyncio
import time
from typing import Any, Dict, List, Optional
from app.models.schemas import QuestionInternal


class SessionCache:
    """Asyncio-safe in-memory session store with TTL eviction."""

    DEFAULT_TTL_SECONDS: int = 30 * 60  # 30 minutes

    def __init__(self, ttl_seconds: int = DEFAULT_TTL_SECONDS):
        self.ttl_seconds = ttl_seconds
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._lock = asyncio.Lock()

    async def put(self, session_id: str, topic_id: str, questions: List[QuestionInternal]) -> None:
        """Store questions for a session ID with current timestamp."""
        async with self._lock:
            self._evict_expired_unsafe()
            self._sessions[session_id] = {
                "created_at": time.time(),
                "topic_id": topic_id,
                "questions": questions,
            }

    async def get(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve active session, returning None if expired or non-existent."""
        async with self._lock:
            self._evict_expired_unsafe()
            return self._sessions.get(session_id)

    async def remove(self, session_id: str) -> None:
        """Remove a session from cache."""
        async with self._lock:
            self._sessions.pop(session_id, None)

    async def count(self) -> int:
        """Return count of active sessions."""
        async with self._lock:
            self._evict_expired_unsafe()
            return len(self._sessions)

    def _evict_expired_unsafe(self) -> None:
        """Purge sessions older than ttl_seconds (must be called within lock)."""
        now = time.time()
        expired = [
            sid
            for sid, data in self._sessions.items()
            if now - data.get("created_at", 0) > self.ttl_seconds
        ]
        for sid in expired:
            del self._sessions[sid]
