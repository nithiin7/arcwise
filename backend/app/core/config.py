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
    redis_url: str = "redis://localhost:6379"
    use_redis: bool = False
    cors_origins: list[str] = ["http://localhost:3000"]
    log_level: str = "INFO"


settings = Settings()
