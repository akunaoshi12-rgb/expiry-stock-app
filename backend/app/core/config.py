import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    supabase_url: str | None
    supabase_service_role_key: str | None
    supabase_publishable_key: str | None
    frontend_url: str
    frontend_urls: str | None = None
    supabase_timeout_seconds: float = 5.0


def get_settings() -> Settings:
    return Settings(
        supabase_url=os.getenv("SUPABASE_URL"),
        supabase_service_role_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        supabase_publishable_key=os.getenv("SUPABASE_PUBLISHABLE_KEY"),
        frontend_url=os.getenv("FRONTEND_URL", "http://127.0.0.1:3000"),
        frontend_urls=os.getenv("FRONTEND_URLS"),
    )
