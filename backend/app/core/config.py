import secrets

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    anthropic_api_key: str | None = None
    openai_api_key: str | None = None
    gemini_api_key: str | None = None
    xai_api_key: str | None = None
    groq_api_key: str | None = None
    ollama_base_url: str = "http://localhost:11434"
    default_model: str = "claude-sonnet-4-6"
    database_url: str = "postgresql+asyncpg://arcwise:arcwise@localhost:5432/arcwise"
    redis_url: str = "redis://localhost:6379"
    use_redis: bool = False
    cors_origins: list[str] = ["http://localhost:3000"]
    log_level: str = "WARNING"

    # Auth
    authentication_required: bool = True
    jwt_secret: str = secrets.token_urlsafe(32)
    jwt_algorithm: str = "HS256"
    jwt_expire_hours: int = 24
    frontend_url: str = "http://localhost:3000"

    # OAuth
    github_client_id: str | None = None
    github_client_secret: str | None = None
    google_client_id: str | None = None
    google_client_secret: str | None = None

    # SMTP (for reset password emails)
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from_email: str = "noreply@arcwise.app"


settings = Settings()
