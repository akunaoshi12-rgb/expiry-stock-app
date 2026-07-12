import pytest

from app.core.config import Settings
from app.core.supabase import supabase_rest_headers


def settings(service_key: str | None) -> Settings:
    return Settings(
        supabase_url="https://example.supabase.co",
        supabase_service_role_key=service_key,
        supabase_publishable_key="sb_publishable_test",
        frontend_url="http://localhost:3000",
    )


def test_secret_key_is_not_sent_as_bearer_token() -> None:
    headers = supabase_rest_headers(settings("sb_secret_test"))

    assert headers == {
        "apikey": "sb_secret_test",
        "Accept": "application/json",
    }


def test_legacy_jwt_service_role_key_is_sent_as_bearer_token() -> None:
    jwt_key = "header.payload.signature"

    headers = supabase_rest_headers(settings(jwt_key))

    assert headers == {
        "apikey": jwt_key,
        "Accept": "application/json",
        "Authorization": f"Bearer {jwt_key}",
    }


def test_missing_service_key_is_rejected() -> None:
    with pytest.raises(ValueError):
        supabase_rest_headers(settings(None))
