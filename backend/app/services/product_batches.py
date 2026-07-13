from datetime import date

from app.repositories.product_batches import (
    ProductBatchRepository,
    ProductBatchRepositoryError,
)
from app.schemas.product_batches import (
    ProductBatchCategory,
    ProductBatchCreateRequest,
    ProductBatchItem,
    ProductBatchListItem,
    ProductBatchProduct,
    ProductBatchUpdateRequest,
)


class ProductNotFoundError(Exception):
    pass


class ProductInactiveError(Exception):
    pass


class ProductBatchNotFoundError(Exception):
    pass


class ProductBatchValidationError(Exception):
    pass


class ProductBatchDatabaseError(Exception):
    pass


class ProductBatchService:
    def __init__(self, repository: ProductBatchRepository | None = None) -> None:
        self.repository = repository or ProductBatchRepository()

    def create_batch(self, payload: ProductBatchCreateRequest, user_id: str) -> ProductBatchItem:
        try:
            product = self.repository.get_product_status(str(payload.product_id))
        except ProductBatchRepositoryError as exc:
            raise ProductBatchDatabaseError("Pengecekan produk gagal.") from exc

        if product is None:
            raise ProductNotFoundError("Produk tidak ditemukan.")

        if not bool(product.get("is_active")):
            raise ProductInactiveError("Produk tidak aktif.")

        try:
            created = self.repository.create(payload, user_id)
        except ProductBatchRepositoryError as exc:
            raise ProductBatchDatabaseError("Batch produk gagal disimpan.") from exc

        return ProductBatchItem(
            id=str(created["id"]),
            product_id=str(created["product_id"]),
            batch_number=created.get("batch_number"),
            quantity=int(created["quantity"]),
            received_date=created.get("received_date"),
            expiry_date=created["expiry_date"],
            storage_location=created.get("storage_location"),
            notes=created.get("notes"),
            is_active=bool(created["is_active"]),
            created_at=created["created_at"],
            updated_at=created["updated_at"],
        )

    def list_batches(self) -> list[ProductBatchListItem]:
        try:
            rows = self.repository.list_active()
        except ProductBatchRepositoryError as exc:
            raise ProductBatchDatabaseError("Daftar batch produk gagal diambil.") from exc

        return [self._map_list_item(row) for row in rows]

    def get_batch(self, batch_id: str) -> ProductBatchListItem:
        try:
            row = self.repository.get_by_id(batch_id)
        except ProductBatchRepositoryError as exc:
            raise ProductBatchDatabaseError("Detail batch produk gagal diambil.") from exc

        if row is None:
            raise ProductBatchNotFoundError("Batch tidak ditemukan.")

        return self._map_list_item(row)

    def update_batch(
        self,
        batch_id: str,
        payload: ProductBatchUpdateRequest,
        user_id: str,
    ) -> ProductBatchListItem:
        current = self.get_batch(batch_id)
        received_date = payload.received_date if "received_date" in payload.model_fields_set else current.received_date
        expiry_date = payload.expiry_date if "expiry_date" in payload.model_fields_set else current.expiry_date

        if expiry_date is None:
            raise ProductBatchValidationError("Tanggal expired wajib diisi.")
        if received_date and expiry_date < received_date:
            raise ProductBatchValidationError("Tanggal expired tidak boleh sebelum tanggal diterima.")

        try:
            updated = self.repository.update(batch_id, payload, user_id)
        except ProductBatchRepositoryError as exc:
            raise ProductBatchDatabaseError("Batch produk gagal diperbarui.") from exc

        return self._map_list_item(updated)

    def delete_batch(self, batch_id: str, user_id: str) -> ProductBatchListItem:
        try:
            deleted = self.repository.soft_delete(batch_id, user_id)
        except ProductBatchRepositoryError as exc:
            raise ProductBatchDatabaseError("Batch produk gagal dihapus.") from exc

        return self._map_list_item(deleted)

    def dashboard_summary(self, today: date | None = None) -> dict[str, int]:
        rows = self.list_batches()
        current_day = today or date.today()
        summary = {
            "expired_batches": 0,
            "within_7_days_batches": 0,
            "active_batches": len(rows),
        }

        for row in rows:
            days_left = (row.expiry_date - current_day).days
            if days_left < 0:
                summary["expired_batches"] += 1
            elif days_left <= 7:
                summary["within_7_days_batches"] += 1

        return summary

    def _map_list_item(self, row: dict[str, object]) -> ProductBatchListItem:
        return ProductBatchListItem(
            id=str(row["id"]),
            product_id=str(row["product_id"]),
            batch_number=row.get("batch_number") if isinstance(row.get("batch_number"), str) else None,
            quantity=int(row["quantity"]),
            received_date=row.get("received_date") if isinstance(row.get("received_date"), str) else None,
            expiry_date=row["expiry_date"],
            storage_location=row.get("storage_location") if isinstance(row.get("storage_location"), str) else None,
            notes=row.get("notes") if isinstance(row.get("notes"), str) else None,
            is_active=bool(row["is_active"]),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            product=self._map_product(row.get("product")),
        )

    def _map_product(self, value: object) -> ProductBatchProduct | None:
        if not isinstance(value, dict) or not value.get("id"):
            return None

        category_data = value.get("category")
        category = None
        if isinstance(category_data, dict) and category_data.get("id"):
            category = ProductBatchCategory(
                id=str(category_data["id"]),
                name=str(category_data.get("name", "")),
            )

        return ProductBatchProduct(
            id=str(value["id"]),
            barcode=value.get("barcode") if isinstance(value.get("barcode"), str) else None,
            internal_code=value.get("internal_code") if isinstance(value.get("internal_code"), str) else None,
            name=str(value.get("name", "")),
            category=category,
            is_active=bool(value.get("is_active")),
        )
