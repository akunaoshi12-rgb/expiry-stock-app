from pydantic import BaseModel


class DashboardSummary(BaseModel):
    expired_batches: int
    within_7_days_batches: int
    active_batches: int


class DashboardSummaryResponse(BaseModel):
    data: DashboardSummary
    error: None = None
