from fastapi import APIRouter, Depends

from app.core.auth import AuthenticatedUser, get_current_user
from app.core.errors import error_response
from app.schemas.common import ErrorResponse
from app.schemas.dashboard import DashboardSummary, DashboardSummaryResponse
from app.services.product_batches import ProductBatchDatabaseError, ProductBatchService

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
    responses={500: {"model": ErrorResponse}},
)
def dashboard_summary(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> DashboardSummaryResponse:
    service = ProductBatchService()
    try:
        summary = service.dashboard_summary()
    except ProductBatchDatabaseError:
        return error_response(
            code="DATABASE_ERROR",
            message="Dashboard belum dapat dimuat. Coba lagi nanti.",
            status_code=500,
        )

    return DashboardSummaryResponse(data=DashboardSummary(**summary))
