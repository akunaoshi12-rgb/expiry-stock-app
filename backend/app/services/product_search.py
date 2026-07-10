from typing import Any

from app.repositories.products import ProductRepository, ProductRepositoryError
from app.schemas.products import ProductCategory, ProductSearchItem


class ProductSearchValidationError(Exception):
    pass


class ProductSearchDatabaseError(Exception):
    pass


def normalize_query(query: str) -> str:
    return query.strip()


def looks_like_code(query: str) -> bool:
    return bool(query) and not any(char.isspace() for char in query) and any(
        char.isdigit() for char in query
    )


class ProductSearchService:
    def __init__(self, repository: ProductRepository | None = None) -> None:
        self.repository = repository or ProductRepository()

    def search(self, query: str, limit: int) -> list[ProductSearchItem]:
        normalized_query = normalize_query(query)
        if not normalized_query or len(normalized_query) > 100:
            raise ProductSearchValidationError("Query pencarian tidak valid.")

        code_query = looks_like_code(normalized_query)
        if len(normalized_query) < 2 and not code_query:
            raise ProductSearchValidationError("Query pencarian tidak valid.")

        capped_limit = max(1, min(limit, 10))
        raw_results: list[dict[str, Any]] = []
        seen_ids: set[str] = set()

        try:
            for mode in ("barcode", "internal_code", "name_prefix", "name_contains"):
                if len(raw_results) >= capped_limit:
                    break
                if len(normalized_query) < 2 and mode.startswith("name_"):
                    continue

                remaining = capped_limit - len(raw_results)
                rows = self.repository.search(normalized_query, remaining, mode)
                for row in rows:
                    product_id = str(row.get("id", ""))
                    if product_id and product_id not in seen_ids:
                        raw_results.append(row)
                        seen_ids.add(product_id)
                    if len(raw_results) >= capped_limit:
                        break
        except ProductRepositoryError as exc:
            raise ProductSearchDatabaseError("Pencarian produk gagal.") from exc

        return [self._map_product(row) for row in raw_results]

    def _map_product(self, row: dict[str, Any]) -> ProductSearchItem:
        category_data = row.get("category")
        category = None
        if isinstance(category_data, dict) and category_data.get("id"):
            category = ProductCategory(
                id=str(category_data["id"]),
                name=str(category_data.get("name", "")),
            )

        return ProductSearchItem(
            id=str(row.get("id")),
            barcode=row.get("barcode"),
            internal_code=row.get("internal_code"),
            name=str(row.get("name", "")),
            category=category,
            is_active=bool(row.get("is_active")),
        )

