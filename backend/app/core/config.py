"""
Sentinel - SOC Alert Triage & Incident Response Dashboard
Application configuration.
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Sentinel SOC Dashboard"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-in-production-please")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8 hour shifts

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sentinel.db")

    # AbuseIPDB integration - falls back to mock data if not set
    ABUSEIPDB_API_KEY: str = os.getenv("ABUSEIPDB_API_KEY", "")
    ABUSEIPDB_BASE_URL: str = "https://api.abuseipdb.com/api/v2"
    USE_MOCK_REPUTATION: bool = os.getenv("USE_MOCK_REPUTATION", "true").lower() == "true"

    # Alert generation
    ALERT_GENERATION_ENABLED: bool = True
    ALERT_GENERATION_INTERVAL_SECONDS: int = 15

    # Comma-separated list of allowed origins, e.g. "https://sentinel.up.railway.app".
    # Defaults to "*" for local development; set explicitly in production.
    CORS_ORIGINS_RAW: str = os.getenv("CORS_ORIGINS", "*")

    @property
    def CORS_ORIGINS(self) -> list:
        if self.CORS_ORIGINS_RAW.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS_RAW.split(",") if origin.strip()]

    class Config:
        env_file = ".env"


settings = Settings()