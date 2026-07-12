from typing import Any

import httpx

from app.core.config import Settings, get_settings


class ProfileRepositoryError(Exception):
    pass


class ProfileRepository:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()

    def _base_headers(self) -> dict[str, str]:
        if not self.settings.supabase_url or not self.settings.supabase_service_role_key:
            raise ProfileRepositoryError("Supabase backend environment is not configured.")

        return {
            "apikey": self.settings.supabase_service_role_key,
            "Authorization": f"Bearer {self.settings.supabase_service_role_key}",
            "Accept": "application/json",
        }

    def get_by_id(self, user_id: str) -> dict[str, Any] | None:
        if not self.settings.supabase_url:
            raise ProfileRepositoryError("Supabase backend environment is not configured.")

        url = f"{self.settings.supabase_url.rstrip('/')}/rest/v1/profiles"
        params: dict[str, str | int] = {
            "select": "id,role,is_active",
            "id": f"eq.{user_id}",
            "limit": 1,
        }

        try:
            with httpx.Client(timeout=self.settings.supabase_timeout_seconds) as client:
                response = client.get(url, params=params, headers=self._base_headers())
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise ProfileRepositoryError("Profile database request failed.") from exc

        data = response.json()
        if not isinstance(data, list):
            raise ProfileRepositoryError("Profile database response was invalid.")
        return data[0] if data else None
