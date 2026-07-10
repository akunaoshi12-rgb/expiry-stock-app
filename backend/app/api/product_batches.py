from typing import Any

from fastapi import APIRouter, Body
from pydantic import ValidationError

from app.core.errors import error_response
from app.schemas.common import ErrorResponse
from app.schemas.product_batches import (
    ProductBatchCreateRequest,
    ProductBatchCreateResponse,
)
from app.services.product_batches import (
    ProductBatchDatabaseError,
    ProductBatchService,
    ProductInactiveError,
    ProductNotFoundError,
)

router = APIRouter(prefix="/api/product-batches", tags=["product-batches"])


@router.post(
    "",
    response_model=ProductBatchCreateResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        409: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
    status_code=201,
)
def create_product_batch(payload: dict[str, Any] = Body(...)) -> ProductBatchCreateResponse:
    try:
        request = ProductBatchCreateRequest.model_validate(payload)
    except ValidationError:
        return error_response(
            code="VALIDATION_ERROR",
            message="Data batch tidak valid.",
            status_code=400,
        )

    service = ProductBatchService()
    try:
        created = service.create_batch(request)
    except ProductNotFoundError:
        return error_response(
            code="PRODUCT_NOT_FOUND",
            message="Produk tidak ditemukan.",
            status_code=404,
        )
    except ProductInactiveError:
        return error_response(
            code="PRODUCT_INACTIVE",
            message="Produk tidak aktif.",
            status_code=409,
        )
    except ProductBatchDatabaseError:
        return error_response(
            code="DATABASE_ERROR",
            message="Batch belum dapat disimpan. Coba lagi nanti.",
            status_code=500,
        )

    return ProductBatchCreateResponse(data=created)
