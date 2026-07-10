from typing import Any

import httpx

from app.core.config import Settings, get_settings
from app.schemas.product_batches import ProductBatchCreateRequest


class ProductBatchRepositoryError(Exception):
    pass


class ProductBatchRepository:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()

    def _base_headers(self) -> dict[str, str]:
        if not self.settings.supabase_url or not self.settings.supabase_service_role_key:
            raise ProductBatchRepositoryError("Supabase backend environment is not configured.")

        return {
            "apikey": self.settings.supabase_service_role_key,
            "Authorization": f"Bearer {self.settings.supabase_service_role_key}",
            "Accept": "application/json",
        }

    def _rest_url(self, table: str) -> str:
        if not self.settings.supabase_url:
            raise ProductBatchRepositoryError("Supabase backend environment is not configured.")

        return f"{self.settings.supabase_url.rstrip('/')}/rest/v1/{table}"

    def get_product_status(self, product_id: str) -> dict[str, Any] | None:
        params: dict[str, str | int] = {
            "select": "id,is_active",
            "id": f"eq.{product_id}",
            "limit": 1,
        }

        try:
            with httpx.Client(timeout=self.settings.supabase_timeout_seconds) as client:
                response = client.get(
                    self._rest_url("products"),
                    params=params,
                    headers=self._base_headers(),
                )
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise ProductBatchRepositoryError("Product lookup database request failed.") from exc

        data = response.json()
        if not isinstance(data, list):
            raise ProductBatchRepositoryError("Product lookup database response was invalid.")
        return data[0] if data else None

    def create(self, payload: ProductBatchCreateRequest) -> dict[str, Any]:
        body = {
            "product_id": str(payload.product_id),
            "batch_number": payload.batch_number,
            "quantity": payload.quantity,
            "received_date": payload.received_date.isoformat() if payload.received_date else None,
            "expiry_date": payload.expiry_date.isoformat(),
            "storage_location": payload.storage_location,
            "notes": payload.notes,
        }
        headers = {
            **self._base_headers(),
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

        try:
            with httpx.Client(timeout=self.settings.supabase_timeout_seconds) as client:
                response = client.post(
                    self._rest_url("product_batches"),
                    json=body,
                    headers=headers,
                )
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise ProductBatchRepositoryError("Product batch database request failed.") from exc

        data = response.json()
        if not isinstance(data, list) or not data:
            raise ProductBatchRepositoryError("Product batch database response was invalid.")
        first_item = data[0]
        if not isinstance(first_item, dict):
            raise ProductBatchRepositoryError("Product batch database response was invalid.")
        return first_item
