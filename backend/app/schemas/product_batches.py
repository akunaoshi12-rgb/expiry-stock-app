from datetime import date, datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, model_validator


class ProductBatchCreateRequest(BaseModel):
    product_id: UUID
    batch_number: str | None = Field(default=None, max_length=100)
    quantity: int = Field(ge=0, le=1_000_000)
    received_date: date | None = None
    expiry_date: date
    storage_location: str | None = Field(default=None, max_length=150)
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("batch_number", "storage_location", "notes", mode="before")
    @classmethod
    def blank_string_to_none(cls, value: Any) -> Any:
        if isinstance(value, str):
            normalized = value.strip()
            return normalized or None
        return value

    @model_validator(mode="after")
    def validate_date_order(self) -> "ProductBatchCreateRequest":
        if self.received_date and self.expiry_date < self.received_date:
            raise ValueError("expiry_date tidak boleh sebelum received_date.")
        return self


class ProductBatchUpdateRequest(BaseModel):
    batch_number: str | None = Field(default=None, max_length=100)
    quantity: int | None = Field(default=None, ge=0, le=1_000_000)
    received_date: date | None = None
    expiry_date: date | None = None
    storage_location: str | None = Field(default=None, max_length=150)
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("batch_number", "storage_location", "notes", mode="before")
    @classmethod
    def blank_string_to_none(cls, value: Any) -> Any:
        if isinstance(value, str):
            normalized = value.strip()
            return normalized or None
        return value

    @model_validator(mode="after")
    def validate_date_order(self) -> "ProductBatchUpdateRequest":
        if self.received_date and self.expiry_date and self.expiry_date < self.received_date:
            raise ValueError("expiry_date tidak boleh sebelum received_date.")
        return self


class ProductBatchItem(BaseModel):
    id: str
    product_id: str
    batch_number: str | None
    quantity: int
    received_date: date | None
    expiry_date: date
    storage_location: str | None
    notes: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ProductBatchCategory(BaseModel):
    id: str
    name: str


class ProductBatchProduct(BaseModel):
    id: str
    barcode: str | None
    internal_code: str | None
    name: str
    category: ProductBatchCategory | None
    is_active: bool


class ProductBatchListItem(ProductBatchItem):
    product: ProductBatchProduct | None


class ProductBatchCreateResponse(BaseModel):
    data: ProductBatchItem
    error: None = None


class ProductBatchListResponse(BaseModel):
    data: list[ProductBatchListItem]
    error: None = None


class ProductBatchDetailResponse(BaseModel):
    data: ProductBatchListItem
    error: None = None


class ProductBatchUpdateResponse(BaseModel):
    data: ProductBatchListItem
    error: None = None


class ProductBatchDeleteResponse(BaseModel):
    data: ProductBatchListItem
    error: None = None
