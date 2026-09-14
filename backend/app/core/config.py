"""Configuration module loading environment variables."""

import os
from typing import List


class Settings:
    """Application settings derived from environment variables."""

    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()

    @property
    def allowed_origins(self) -> List[str]:
        """Parsed list of allowed CORS origins."""
        raw_origins = os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001",
        )
        return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


settings = Settings()
