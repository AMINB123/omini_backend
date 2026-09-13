from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    redis_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    gemini_api_key: str
    smtp_host: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    frontend_url: str
    backend_public_url: str = ""
    zibal_merchant_id: str

    class Config:
        env_file = ".env"


settings = Settings()