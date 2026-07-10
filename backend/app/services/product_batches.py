from app.repositories.product_batches import (
    ProductBatchRepository,
    ProductBatchRepositoryError,
)
from app.schemas.product_batches import ProductBatchCreateRequest, ProductBatchItem


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
