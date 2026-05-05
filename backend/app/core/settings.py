from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    aws_region: str = "eu-central-1"
    aws_s3_bucket: str
    clerk_secret_key: str
    internal_api_key: str = ""
    internal_sync_signing_secret: str = ""
    internal_sync_max_skew_seconds: int = 300
    openai_api_key: str

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
