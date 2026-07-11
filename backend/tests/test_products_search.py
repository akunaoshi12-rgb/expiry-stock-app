import pytest

from app.repositories.products import ProductRepositoryError
from app.services.product_search import ProductSearchService
from tests.direct_client import DirectClient


client = DirectClient()


def product(
    product_id: str,
    name: str,
    barcode: str | None = None,
    internal_code: str | None = None,
    is_active: bool = True,
) -> dict[str, object]:
    return {
        "id": product_id,
        "barcode": barcode,
        "internal_code": internal_code,
        "name": name,
        "is_active": is_active,
        "category": {
            "id": "cat-1",
            "name": "BULK",
        },
    }


class FakeProductRepository:
    def __init__(self, rows_by_mode: dict[str, list[dict[str, object]]]) -> None:
        self.rows_by_mode = rows_by_mode
        self.calls: list[tuple[str, int, str]] = []

    def search(self, query: str, limit: int, mode: str) -> list[dict[str, object]]:
        self.calls.append((query, limit, mode))
        return self.rows_by_mode.get(mode, [])[:limit]


class FailingProductRepository:
    def search(self, query: str, limit: int, mode: str) -> list[dict[str, object]]:
        raise ProductRepositoryError("secret database details")


def test_health_still_works() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["data"]["status"] == "ok"


def test_dashboard_summary_still_works() -> None:
    response = client.get("/api/dashboard/summary")

    assert response.status_code == 200
    assert response.json()["data"]["expired_batches"] == 5


def test_empty_query_is_rejected() -> None:
    response = client.get("/api/products/search?q=   ")

    assert response.status_code == 400
    assert response.json() == {
        "data": None,
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "Query pencarian tidak valid.",
            "details": {},
        },
    }


def test_short_name_query_is_rejected() -> None:
    response = client.get("/api/products/search?q=a")

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_exact_barcode_is_first() -> None:
    repository = FakeProductRepository(
        {
            "barcode": [product("1", "Almond Milk", barcode="089686123456")],
            "name_prefix": [product("2", "Almond Butter", barcode="111")],
        }
    )
    service = ProductSearchService(repository=repository)  # type: ignore[arg-type]

    results = service.search("089686123456", 10)

    assert [item.id for item in results] == ["1", "2"]
    assert results[0].barcode == "089686123456"


def test_leading_zero_barcode_is_preserved() -> None:
    repository = FakeProductRepository(
        {"barcode": [product("1", "Milk", barcode="089686123456")]}
    )
    service = ProductSearchService(repository=repository)  # type: ignore[arg-type]

    results = service.search("089686123456", 10)

    assert results[0].barcode == "089686123456"


def test_exact_internal_code_is_found_after_barcode() -> None:
    repository = FakeProductRepository(
        {
            "barcode": [],
            "internal_code": [
                product("1", "Internal Product", internal_code="INT-001")
            ],
        }
    )
    service = ProductSearchService(repository=repository)  # type: ignore[arg-type]

    results = service.search("INT-001", 10)

    assert len(results) == 1
    assert results[0].internal_code == "INT-001"


def test_partial_name_search_works_and_deduplicates() -> None:
    repository = FakeProductRepository(
        {
            "name_prefix": [product("1", "Almond Milk")],
            "name_contains": [
                product("1", "Almond Milk"),
                product("2", "Roasted Almond"),
            ],
        }
    )
    service = ProductSearchService(repository=repository)  # type: ignore[arg-type]

    results = service.search("almond", 10)

    assert [item.id for item in results] == ["1", "2"]


def test_inactive_products_do_not_appear_when_repository_filters_them() -> None:
    repository = FakeProductRepository(
        {
            "name_prefix": [product("1", "Active Almond")],
            "name_contains": [],
        }
    )
    service = ProductSearchService(repository=repository)  # type: ignore[arg-type]

    results = service.search("almond", 10)

    assert all(item.is_active for item in results)


def test_limit_is_capped_to_10() -> None:
    repository = FakeProductRepository(
        {
            "name_prefix": [
                product(str(index), f"Almond {index}") for index in range(1, 12)
            ],
        }
    )
    service = ProductSearchService(repository=repository)  # type: ignore[arg-type]

    results = service.search("almond", 10)

    assert len(results) == 10


def test_no_results_returns_empty_data(monkeypatch: pytest.MonkeyPatch) -> None:
    class EmptyService:
        def search(self, query: str, limit: int) -> list[object]:
            return []

    monkeypatch.setattr("app.api.products.ProductSearchService", EmptyService)

    response = client.get("/api/products/search?q=almond")

    assert response.status_code == 200
    assert response.json() == {"data": [], "error": None}


def test_database_error_returns_safe_response(monkeypatch: pytest.MonkeyPatch) -> None:
    class BrokenService:
        def search(self, query: str, limit: int) -> list[object]:
            from app.services.product_search import ProductSearchDatabaseError

            raise ProductSearchDatabaseError("sensitive backend detail")

    monkeypatch.setattr("app.api.products.ProductSearchService", BrokenService)

    response = client.get("/api/products/search?q=almond")

    assert response.status_code == 500
    body = response.json()
    assert body["error"]["code"] == "INTERNAL_ERROR"
    assert "SUPABASE" not in body["error"]["message"]
