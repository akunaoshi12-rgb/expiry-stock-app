from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.core.auth import AuthenticatedUser, get_current_user
from app.core.errors import error_response
from app.schemas.common import ErrorResponse
from app.schemas.products import ProductSearchResponse
from app.services.product_search import (
    ProductSearchDatabaseError,
    ProductSearchService,
    ProductSearchValidationError,
)

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get(
    "/search",
    response_model=ProductSearchResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def search_products(
    q: Annotated[str, Query()],
    limit: Annotated[int, Query(ge=1, le=10)] = 10,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> ProductSearchResponse:
    service = ProductSearchService()
    try:
        products = service.search(q, limit)
    except ProductSearchValidationError:
        return error_response(
            code="VALIDATION_ERROR",
            message="Query pencarian tidak valid.",
            status_code=400,
        )
    except ProductSearchDatabaseError:
        return error_response(
            code="INTERNAL_ERROR",
            message="Pencarian produk sedang bermasalah. Coba lagi nanti.",
            status_code=500,
        )

    return ProductSearchResponse(data=products)
