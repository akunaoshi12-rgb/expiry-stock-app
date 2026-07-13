from typing import Any
from uuid import UUID

from fastapi import APIRouter, Body, Depends, Path
from pydantic import ValidationError

from app.core.auth import AuthenticatedUser, get_current_user
from app.core.errors import error_response
from app.schemas.common import ErrorResponse
from app.schemas.product_batches import (
    ProductBatchCreateRequest,
    ProductBatchCreateResponse,
    ProductBatchDeleteResponse,
    ProductBatchDetailResponse,
    ProductBatchListResponse,
    ProductBatchUpdateRequest,
    ProductBatchUpdateResponse,
)
from app.services.product_batches import (
    ProductBatchDatabaseError,
    ProductBatchNotFoundError,
    ProductBatchService,
    ProductBatchValidationError,
    ProductInactiveError,
    ProductNotFoundError,
)

router = APIRouter(prefix="/api/product-batches", tags=["product-batches"])


@router.get(
    "",
    response_model=ProductBatchListResponse,
    responses={500: {"model": ErrorResponse}},
)
def list_product_batches(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> ProductBatchListResponse:
    service = ProductBatchService()
    try:
        batches = service.list_batches()
    except ProductBatchDatabaseError:
        return error_response(
            code="DATABASE_ERROR",
            message="Daftar batch belum dapat dimuat. Coba lagi nanti.",
            status_code=500,
        )

    return ProductBatchListResponse(data=batches)


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
def create_product_batch(
    payload: dict[str, Any] = Body(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> ProductBatchCreateResponse:
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
        created = service.create_batch(request, current_user.id)
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


@router.get(
    "/{batch_id}",
    response_model=ProductBatchDetailResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def get_product_batch(
    batch_id: str = Path(),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> ProductBatchDetailResponse:
    service = ProductBatchService()
    try:
        batch = service.get_batch(batch_id)
    except ProductBatchNotFoundError:
        return error_response(
            code="BATCH_NOT_FOUND",
            message="Batch tidak ditemukan.",
            status_code=404,
        )
    except ProductBatchDatabaseError:
        return error_response(
            code="DATABASE_ERROR",
            message="Detail batch belum dapat dimuat. Coba lagi nanti.",
            status_code=500,
        )

    return ProductBatchDetailResponse(data=batch)


@router.patch(
    "/{batch_id}",
    response_model=ProductBatchUpdateResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
def update_product_batch(
    batch_id: str = Path(),
    payload: dict[str, Any] = Body(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> ProductBatchUpdateResponse:
    try:
        request = ProductBatchUpdateRequest.model_validate(payload)
    except ValidationError:
        return error_response(
            code="VALIDATION_ERROR",
            message="Data batch tidak valid.",
            status_code=400,
        )

    service = ProductBatchService()
    try:
        updated = service.update_batch(batch_id, request, current_user.id)
    except ProductBatchValidationError:
        return error_response(
            code="VALIDATION_ERROR",
            message="Data batch tidak valid.",
            status_code=400,
        )
    except ProductBatchNotFoundError:
        return error_response(
            code="BATCH_NOT_FOUND",
            message="Batch tidak ditemukan.",
            status_code=404,
        )
    except ProductBatchDatabaseError:
        return error_response(
            code="DATABASE_ERROR",
            message="Batch belum dapat diperbarui. Coba lagi nanti.",
            status_code=500,
        )

    return ProductBatchUpdateResponse(data=updated)


@router.delete(
    "/{batch_id}",
    response_model=ProductBatchDeleteResponse,
    responses={
        400: {"model": ErrorResponse},
        403: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
def delete_product_batch(
    batch_id: str = Path(),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> ProductBatchDeleteResponse:
    try:
        normalized_batch_id = str(UUID(batch_id))
    except ValueError:
        return error_response(
            code="VALIDATION_ERROR",
            message="ID batch tidak valid.",
            status_code=400,
        )

    service = ProductBatchService()
    try:
        deleted = service.delete_batch(normalized_batch_id, current_user.id)
    except ProductBatchNotFoundError:
        return error_response(
            code="BATCH_NOT_FOUND",
            message="Batch tidak ditemukan.",
            status_code=404,
        )
    except ProductBatchDatabaseError:
        return error_response(
            code="DATABASE_ERROR",
            message="Batch belum dapat dihapus. Coba lagi nanti.",
            status_code=500,
        )

    return ProductBatchDeleteResponse(data=deleted)
