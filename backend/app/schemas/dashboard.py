from pydantic import BaseModel


class DashboardSummary(BaseModel):
    expired_batches: int
    critical_batches: int
    urgent_batches: int
    warning_batches: int
    at_risk_stock: int


class DashboardSummaryResponse(BaseModel):
    data: DashboardSummary
    error: None = None
