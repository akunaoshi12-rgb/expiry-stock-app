from pydantic import BaseModel


class ProductCategory(BaseModel):
    id: str
    name: str


class ProductSearchItem(BaseModel):
    id: str
    barcode: str | None
    internal_code: str | None
    name: str
    category: ProductCategory | None
    is_active: bool


class ProductSearchResponse(BaseModel):
    data: list[ProductSearchItem]
    error: None = None

