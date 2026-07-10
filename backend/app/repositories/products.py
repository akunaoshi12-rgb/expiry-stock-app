from typing import Any, Literal

import httpx

from app.core.config import Settings, get_settings

SearchMode = Literal["barcode", "internal_code", "name_prefix", "name_contains"]


class ProductRepositoryError(Exception):
    pass


class ProductRepository:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()

    def search(self, query: str, limit: int, mode: SearchMode) -> list[dict[str, Any]]:
        if not self.settings.supabase_url or not self.settings.supabase_service_role_key:
            raise ProductRepositoryError("Supabase backend environment is not configured.")

        base_url = self.settings.supabase_url.rstrip("/")
        url = f"{base_url}/rest/v1/products"
        params: dict[str, str | int] = {
            "select": "id,barcode,internal_code,name,is_active,category:categories(id,name)",
            "is_active": "eq.true",
            "limit": limit,
            "order": "name.asc",
        }

        if mode == "barcode":
            params["barcode"] = f"eq.{query}"
        elif mode == "internal_code":
            params["internal_code"] = f"eq.{query}"
        elif mode == "name_prefix":
            params["name"] = f"ilike.{query}%"
        else:
            params["name"] = f"ilike.%{query}%"

        headers = {
            "apikey": self.settings.supabase_service_role_key,
            "Authorization": f"Bearer {self.settings.supabase_service_role_key}",
            "Accept": "application/json",
        }

        try:
            with httpx.Client(timeout=self.settings.supabase_timeout_seconds) as client:
                response = client.get(url, params=params, headers=headers)
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise ProductRepositoryError("Product search database request failed.") from exc

        data = response.json()
        if not isinstance(data, list):
            raise ProductRepositoryError("Product search database response was invalid.")
        return data

