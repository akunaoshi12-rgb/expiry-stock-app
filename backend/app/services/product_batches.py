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
)


class ProductNotFoundError(Exception):
    pass


class ProductInactiveError(Exception):
    pass


class ProductBatchDatabaseError(Exception):
    pass


class ProductBatchService:
    def __init__(self, repository: ProductBatchRepository | None = None) -> None:
        self.repository = repository or ProductBatchRepository()

    def create_batch(self, payload: ProductBatchCreateRequest) -> ProductBatchItem:
        try:
            product = self.repository.get_product_status(str(payload.product_id))
        except ProductBatchRepositoryError as exc:
            raise ProductBatchDatabaseError("Pengecekan produk gagal.") from exc

        if product is None:
            raise ProductNotFoundError("Produk tidak ditemukan.")

        if not bool(product.get("is_active")):
            raise ProductInactiveError("Produk tidak aktif.")

        try:
            created = self.repository.create(payload)
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
