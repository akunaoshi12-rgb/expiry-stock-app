from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.dashboard import router as dashboard_router
from app.api.product_batches import router as product_batches_router
from app.api.products import router as products_router
from app.core.config import get_settings
from app.core.errors import ApiErrorException, api_error_response

settings = get_settings()

app = FastAPI(
    title="Expiry Stock API",
    version="0.1.0",
)

allowed_origins = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]
if settings.frontend_url not in allowed_origins:
    allowed_origins.append(settings.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(product_batches_router)
app.include_router(products_router)
app.include_router(dashboard_router)


@app.exception_handler(ApiErrorException)
def handle_api_error(_: object, exc: ApiErrorException) -> object:
    return api_error_response(exc)


@app.get("/")
def root() -> dict[str, object]:
    return {
        "data": {
            "name": "Expiry Stock API",
            "status": "ok",
            "documentation": "/docs",
        },
        "error": None,
    }


@app.get("/health")
def health_check() -> dict[str, object]:
    return {
        "data": {
            "status": "ok",
        },
        "error": None,
    }

