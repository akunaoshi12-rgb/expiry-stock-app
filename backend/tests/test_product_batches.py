from datetime import date
from uuid import uuid4

import pytest

from app.repositories.product_batches import ProductBatchRepositoryError
from app.schemas.product_batches import ProductBatchCreateRequest
from app.services.product_batches import (
    ProductBatchDatabaseError,
    ProductBatchService,
    ProductInactiveError,
    ProductNotFoundError,
)
from tests.direct_client import DirectClient


client = DirectClient()
STAFF_HEADERS = {"Authorization": "Bearer staff-token"}
ADMIN_HEADERS = {"Authorization": "Bearer admin-token"}


def valid_payload(product_id: str | None = None) -> dict[str, object]:
    return {
        "product_id": product_id or str(uuid4()),
        "batch_number": " BATCH-001 ",
        "quantity": 12,
        "received_date": "2026-07-11",
        "expiry_date": "2026-10-31",
        "storage_location": " Gudang A ",
        "notes": " Rak pendingin ",
    }


def created_row(product_id: str) -> dict[str, object]:
    return {
        "id": str(uuid4()),
        "product_id": product_id,
        "batch_number": "BATCH-001",
        "quantity": 12,
        "received_date": "2026-07-11",
        "expiry_date": "2026-10-31",
        "storage_location": "Gudang A",
        "notes": "Rak pendingin",
        "is_active": True,
        "created_at": "2026-07-11T08:00:00+00:00",
        "updated_at": "2026-07-11T08:00:00+00:00",
    }


class FakeProductBatchRepository:
    def __init__(
        self,
        product: dict[str, object] | None = None,
        created: dict[str, object] | None = None,
        fail_create: bool = False,
        rows: list[dict[str, object]] | None = None,
        fail_list: bool = False,
    ) -> None:
        self.product = product
        self.created = created
        self.fail_create = fail_create
        self.rows = rows or []
        self.fail_list = fail_list
        self.created_payload: ProductBatchCreateRequest | None = None

    def get_product_status(self, product_id: str) -> dict[str, object] | None:
        return self.product

    def create(self, payload: ProductBatchCreateRequest, user_id: str) -> dict[str, object]:
        if self.fail_create:
            raise ProductBatchRepositoryError("database internal detail")

        self.created_payload = payload
        return self.created or created_row(str(payload.product_id))

    def list_active(self) -> list[dict[str, object]]:
        if self.fail_list:
            raise ProductBatchRepositoryError("database internal detail")

        return self.rows

    def get_by_id(self, batch_id: str) -> dict[str, object] | None:
        return self.rows[0] if self.rows else None

    def update(self, batch_id: str, payload: object, user_id: str) -> dict[str, object]:
        if not self.rows:
            raise ProductBatchRepositoryError("missing")
        row = dict(self.rows[0])
        for key, value in payload.model_dump(mode="json", exclude_unset=True).items():
            row[key] = value
        return row

    def soft_delete(self, batch_id: str, user_id: str) -> dict[str, object]:
        if not self.rows:
            raise ProductBatchRepositoryError("missing")
        row = dict(self.rows[0])
        row["is_active"] = False
        return row


def batch_row_with_product(product_id: str) -> dict[str, object]:
    return {
        **created_row(product_id),
        "product": {
            "id": product_id,
            "barcode": "1005623",
            "internal_code": None,
            "name": "ALMOND MILK WITH QURMA CHOCO",
            "category": {
                "id": "cat-1",
                "name": "GROWELL BAR",
            },
            "is_active": True,
        },
    }


def test_create_batch_success() -> None:
    product_id = str(uuid4())
    repository = FakeProductBatchRepository(product={"id": product_id, "is_active": True})
    service = ProductBatchService(repository=repository)  # type: ignore[arg-type]

    result = service.create_batch(
        ProductBatchCreateRequest.model_validate(valid_payload(product_id)),
        user_id="staff-user",
    )

    assert result.product_id == product_id
    assert result.quantity == 12
    assert result.batch_number == "BATCH-001"
    assert repository.created_payload is not None


def test_product_not_found() -> None:
    service = ProductBatchService(repository=FakeProductBatchRepository(product=None))  # type: ignore[arg-type]

    with pytest.raises(ProductNotFoundError):
        service.create_batch(ProductBatchCreateRequest.model_validate(valid_payload()), user_id="staff-user")


def test_product_inactive() -> None:
    product_id = str(uuid4())
    repository = FakeProductBatchRepository(product={"id": product_id, "is_active": False})
    service = ProductBatchService(repository=repository)  # type: ignore[arg-type]

    with pytest.raises(ProductInactiveError):
        service.create_batch(
            ProductBatchCreateRequest.model_validate(valid_payload(product_id)),
            user_id="staff-user",
        )


def test_list_batches_success() -> None:
    product_id = str(uuid4())
    repository = FakeProductBatchRepository(rows=[batch_row_with_product(product_id)])
    service = ProductBatchService(repository=repository)  # type: ignore[arg-type]

    result = service.list_batches()

    assert len(result) == 1
    assert result[0].product_id == product_id
    assert result[0].product is not None
    assert result[0].product.name == "ALMOND MILK WITH QURMA CHOCO"
    assert result[0].product.category is not None
    assert result[0].product.category.name == "GROWELL BAR"


def test_list_batches_database_error() -> None:
    service = ProductBatchService(repository=FakeProductBatchRepository(fail_list=True))  # type: ignore[arg-type]

    with pytest.raises(ProductBatchDatabaseError):
        service.list_batches()


def test_dashboard_summary_is_computed_from_batches() -> None:
    product_id = str(uuid4())
    rows = [
        {**batch_row_with_product(product_id), "id": str(uuid4()), "expiry_date": "2026-07-10", "quantity": 2},
        {**batch_row_with_product(product_id), "id": str(uuid4()), "expiry_date": "2026-07-11", "quantity": 3},
        {**batch_row_with_product(product_id), "id": str(uuid4()), "expiry_date": "2026-07-19", "quantity": 5},
        {**batch_row_with_product(product_id), "id": str(uuid4()), "expiry_date": "2026-08-05", "quantity": 7},
    ]
    service = ProductBatchService(repository=FakeProductBatchRepository(rows=rows))  # type: ignore[arg-type]

    summary = service.dashboard_summary(today=date(2026, 7, 11))

    assert summary == {
        "expired_batches": 1,
        "within_7_days_batches": 1,
        "active_batches": 4,
    }


def test_uuid_invalid_is_rejected_by_endpoint() -> None:
    payload = valid_payload("not-a-uuid")

    response = client.post("/api/product-batches", json=payload, headers=STAFF_HEADERS)

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_quantity_zero_is_accepted_by_schema() -> None:
    payload = valid_payload()
    payload["quantity"] = 0

    parsed = ProductBatchCreateRequest.model_validate(payload)

    assert parsed.quantity == 0


def test_quantity_negative_is_rejected() -> None:
    payload = valid_payload()
    payload["quantity"] = -1

    response = client.post("/api/product-batches", json=payload, headers=STAFF_HEADERS)

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_expiry_date_missing_is_rejected() -> None:
    payload = valid_payload()
    del payload["expiry_date"]

    response = client.post("/api/product-batches", json=payload, headers=STAFF_HEADERS)

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_expiry_before_received_is_rejected() -> None:
    payload = valid_payload()
    payload["received_date"] = "2026-10-31"
    payload["expiry_date"] = "2026-07-11"

    response = client.post("/api/product-batches", json=payload, headers=STAFF_HEADERS)

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_blank_strings_become_none() -> None:
    payload = ProductBatchCreateRequest.model_validate(
        {
            **valid_payload(),
            "batch_number": "   ",
            "storage_location": "",
            "notes": " ",
        }
    )

    assert payload.batch_number is None
    assert payload.storage_location is None
    assert payload.notes is None


def test_database_error_is_sanitized_by_endpoint(monkeypatch: pytest.MonkeyPatch) -> None:
    class BrokenService:
        def create_batch(self, payload: ProductBatchCreateRequest, user_id: str) -> object:
            raise ProductBatchDatabaseError("sensitive backend detail")

    monkeypatch.setattr("app.api.product_batches.ProductBatchService", BrokenService)

    response = client.post("/api/product-batches", json=valid_payload(), headers=STAFF_HEADERS)

    assert response.status_code == 500
    body = response.json()
    assert body["error"]["code"] == "DATABASE_ERROR"
    assert "SUPABASE" not in body["error"]["message"]


def test_list_database_error_is_sanitized_by_endpoint(monkeypatch: pytest.MonkeyPatch) -> None:
    class BrokenService:
        def list_batches(self) -> list[object]:
            raise ProductBatchDatabaseError("sensitive backend detail")

    monkeypatch.setattr("app.api.product_batches.ProductBatchService", BrokenService)

    response = client.get("/api/product-batches", headers=STAFF_HEADERS)

    assert response.status_code == 500
    body = response.json()
    assert body["error"]["code"] == "DATABASE_ERROR"
    assert "SUPABASE" not in body["error"]["message"]


def test_health_still_works() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["data"]["status"] == "ok"


def test_dashboard_still_works() -> None:
    response = client.get("/api/dashboard/summary", headers=STAFF_HEADERS)

    assert response.status_code == 200
    assert response.json()["data"]["expired_batches"] >= 0


def test_product_search_still_works(monkeypatch: pytest.MonkeyPatch) -> None:
    class EmptyService:
        def search(self, query: str, limit: int) -> list[object]:
            return []

    monkeypatch.setattr("app.api.products.ProductSearchService", EmptyService)

    response = client.get("/api/products/search?q=almond", headers=STAFF_HEADERS)

    assert response.status_code == 200
    assert response.json() == {"data": [], "error": None}


def test_staff_can_update_batch(monkeypatch: pytest.MonkeyPatch) -> None:
    product_id = str(uuid4())

    class EditableService:
        def update_batch(self, batch_id: str, payload: object, user_id: str) -> object:
            assert user_id == "staff-user"
            return ProductBatchService(  # type: ignore[arg-type]
                repository=FakeProductBatchRepository(rows=[batch_row_with_product(product_id)])
            ).get_batch(batch_id)

    monkeypatch.setattr("app.api.product_batches.ProductBatchService", EditableService)

    response = client.patch(
        "/api/product-batches/batch-1",
        json={"quantity": 5},
        headers=STAFF_HEADERS,
    )

    assert response.status_code == 200


def test_staff_cannot_delete_batch() -> None:
    response = client.delete("/api/product-batches/batch-1", headers=STAFF_HEADERS)

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "FORBIDDEN"


def test_admin_can_delete_batch(monkeypatch: pytest.MonkeyPatch) -> None:
    product_id = str(uuid4())

    class DeletableService:
        def delete_batch(self, batch_id: str, user_id: str) -> object:
            assert user_id == "admin-user"
            return ProductBatchService(  # type: ignore[arg-type]
                repository=FakeProductBatchRepository(rows=[batch_row_with_product(product_id)])
            ).get_batch(batch_id)

    monkeypatch.setattr("app.api.product_batches.ProductBatchService", DeletableService)

    response = client.delete("/api/product-batches/batch-1", headers=ADMIN_HEADERS)

    assert response.status_code == 200


def test_date_objects_are_accepted() -> None:
    payload = ProductBatchCreateRequest(
        product_id=uuid4(),
        quantity=1,
        received_date=date(2026, 7, 11),
        expiry_date=date(2026, 10, 31),
    )

    assert payload.quantity == 1
