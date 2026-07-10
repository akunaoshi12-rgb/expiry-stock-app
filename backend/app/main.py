from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Expiry Stock API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3000",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict[str, object]:
    return {
        "data": {
            "status": "ok",
        },
        "error": None,
    }


@app.get("/api/dashboard/summary")
def dashboard_summary() -> dict[str, object]:
    return {
        "data": {
            "expired_batches": 5,
            "critical_batches": 12,
            "urgent_batches": 18,
            "warning_batches": 31,
            "at_risk_stock": 126,
        },
        "error": None,
    }
