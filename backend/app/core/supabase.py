from app.core.config import Settings


def looks_like_jwt(value: str) -> bool:
    return value.count(".") == 2


def supabase_rest_headers(settings: Settings) -> dict[str, str]:
    if not settings.supabase_service_role_key:
        raise ValueError("Supabase service role key is not configured.")

    headers = {
        "apikey": settings.supabase_service_role_key,
        "Accept": "application/json",
    }

    if looks_like_jwt(settings.supabase_service_role_key):
        headers["Authorization"] = f"Bearer {settings.supabase_service_role_key}"

    return headers
