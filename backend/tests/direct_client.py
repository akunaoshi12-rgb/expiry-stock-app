import json
from typing import Any
from urllib.parse import parse_qs, urlparse

from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.api import product_batches, products
from app import main
from app.core.auth import AuthenticatedUser
from app.core.errors import ApiErrorException, api_error_response, error_response
from app.schemas.dashboard import DashboardSummary, DashboardSummaryResponse


class DirectResponse:
    def __init__(self, status_code: int, body: Any) -> None:
        self.status_code = status_code
        self._body = body

    def json(self) -> Any:
        return self._body


class DirectClient:
    def get(self, path: str, headers: dict[str, str] | None = None) -> DirectResponse:
        parsed = urlparse(path)

        if parsed.path == "/health":
            return self._response(main.health_check())

        if parsed.path == "/api/dashboard/summary":
            user = self._authorize(headers)
            if isinstance(user, DirectResponse):
                return user
            return self._response(
                DashboardSummaryResponse(
                    data=DashboardSummary(
                        expired_batches=0,
                        critical_batches=0,
                        urgent_batches=0,
                        warning_batches=0,
                        at_risk_stock=0,
                    )
                )
            )

        if parsed.path == "/api/products/search":
            user = self._authorize(headers)
            if isinstance(user, DirectResponse):
                return user
            query = parse_qs(parsed.query)
            limit = int(query.get("limit", ["10"])[0])
            return self._response(
                products.search_products(q=query.get("q", [""])[0], limit=limit, current_user=user)
            )

        if parsed.path == "/api/product-batches":
            user = self._authorize(headers)
            if isinstance(user, DirectResponse):
                return user
            return self._response(product_batches.list_product_batches(current_user=user))

        if parsed.path.startswith("/api/product-batches/"):
            user = self._authorize(headers)
            if isinstance(user, DirectResponse):
                return user
            batch_id = parsed.path.rsplit("/", 1)[-1]
            return self._response(product_batches.get_product_batch(batch_id=batch_id, current_user=user))

        return DirectResponse(404, {"detail": "Not Found"})

    def post(
        self,
        path: str,
        json: dict[str, Any],
        headers: dict[str, str] | None = None,
    ) -> DirectResponse:
        if path == "/api/product-batches":
            user = self._authorize(headers)
            if isinstance(user, DirectResponse):
                return user
            result = product_batches.create_product_batch(payload=json, current_user=user)
            return self._response(result, success_status_code=201)

        return DirectResponse(404, {"detail": "Not Found"})

    def patch(
        self,
        path: str,
        json: dict[str, Any],
        headers: dict[str, str] | None = None,
    ) -> DirectResponse:
        if path.startswith("/api/product-batches/"):
            user = self._authorize(headers)
            if isinstance(user, DirectResponse):
                return user
            batch_id = path.rsplit("/", 1)[-1]
            return self._response(product_batches.update_product_batch(batch_id=batch_id, payload=json, current_user=user))

        return DirectResponse(404, {"detail": "Not Found"})

    def delete(self, path: str, headers: dict[str, str] | None = None) -> DirectResponse:
        if path.startswith("/api/product-batches/"):
            user = self._authorize(headers)
            if isinstance(user, DirectResponse):
                return user
            batch_id = path.rsplit("/", 1)[-1]
            try:
                return self._response(product_batches.delete_product_batch(batch_id=batch_id, current_user=user))
            except ApiErrorException as exc:
                return self._response(api_error_response(exc))

        return DirectResponse(404, {"detail": "Not Found"})

    def _authorize(self, headers: dict[str, str] | None) -> AuthenticatedUser | DirectResponse:
        authorization = (headers or {}).get("Authorization")
        if authorization == "Bearer staff-token":
            return AuthenticatedUser(id="staff-user", email="staff@example.com", role="staff")
        if authorization == "Bearer admin-token":
            return AuthenticatedUser(id="admin-user", email="admin@example.com", role="admin")
        if authorization == "Bearer inactive-token":
            return self._response(
                error_response(
                    code="FORBIDDEN",
                    message="Akun tidak memiliki akses ke fitur ini.",
                    status_code=403,
                )
            )
        return self._response(
            error_response(
                code="UNAUTHORIZED",
                message="Sesi tidak valid atau sudah berakhir.",
                status_code=401,
            )
        )

    def _response(self, result: Any, success_status_code: int = 200) -> DirectResponse:
        if isinstance(result, JSONResponse):
            return DirectResponse(result.status_code, json.loads(result.body.decode("utf-8")))

        if isinstance(result, BaseModel):
            return DirectResponse(success_status_code, result.model_dump(mode="json"))

        return DirectResponse(success_status_code, result)
