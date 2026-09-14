"""Configuration module loading environment variables."""

import os
from typing import List
from dotenv import load_dotenv

# Automatically load .env file if present
load_dotenv()


class Settings:
    """Application settings derived from environment variables."""

    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()

    # Quiz Provider & LLM Configuration
    QUIZ_PROVIDER: str = os.getenv("QUIZ_PROVIDER", "mock").lower().strip()
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "").strip()
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b").strip()
    GROQ_REQUEST_TIMEOUT_SECONDS: int = int(
        os.getenv("GROQ_REQUEST_TIMEOUT_SECONDS", "30")
    )

    @property
    def allowed_origins(self) -> List[str]:
        """Parsed list of allowed CORS origins with whitespace and trailing slashes stripped."""
        raw_origins = os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001",
        )
        return [
            origin.strip().rstrip("/")
            for origin in raw_origins.split(",")
            if origin.strip()
        ]


settings = Settings()
