import json
from typing import Any
from urllib.parse import parse_qs, urlparse

from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.api import product_batches, products
from app import main


class DirectResponse:
    def __init__(self, status_code: int, body: Any) -> None:
        self.status_code = status_code
        self._body = body

    def json(self) -> Any:
        return self._body


class DirectClient:
    def get(self, path: str) -> DirectResponse:
        parsed = urlparse(path)

        if parsed.path == "/health":
            return self._response(main.health_check())

        if parsed.path == "/api/dashboard/summary":
            return self._response(main.dashboard_summary())

        if parsed.path == "/api/products/search":
            query = parse_qs(parsed.query)
            limit = int(query.get("limit", ["10"])[0])
            return self._response(products.search_products(q=query.get("q", [""])[0], limit=limit))

        if parsed.path == "/api/product-batches":
            return self._response(product_batches.list_product_batches())

        return DirectResponse(404, {"detail": "Not Found"})

    def post(self, path: str, json: dict[str, Any]) -> DirectResponse:
        if path == "/api/product-batches":
            result = product_batches.create_product_batch(payload=json)
            return self._response(result, success_status_code=201)

        return DirectResponse(404, {"detail": "Not Found"})

    def _response(self, result: Any, success_status_code: int = 200) -> DirectResponse:
        if isinstance(result, JSONResponse):
            return DirectResponse(result.status_code, json.loads(result.body.decode("utf-8")))

        if isinstance(result, BaseModel):
            return DirectResponse(success_status_code, result.model_dump(mode="json"))

        return DirectResponse(success_status_code, result)
