from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.dashboard import router as dashboard_router
from app.api.product_batches import router as product_batches_router
from app.api.products import router as products_router
from app.core.config import get_settings
from app.core.errors import ApiErrorException, api_error_response

settings = get_settings()

CORS_ORIGIN_REGEX = r"^https://expiry-stock-(?:app-git-main|[a-z0-9]+)-tech-me\.vercel\.app$"
DEFAULT_ALLOWED_ORIGINS = (
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "https://expiry-stock-app-git-main-tech-me.vercel.app",
)


def append_unique_origin(origins: list[str], origin: str | None) -> None:
    normalized_origin = (origin or "").strip().rstrip("/")
    if normalized_origin and normalized_origin not in origins:
        origins.append(normalized_origin)


def build_allowed_origins(frontend_url: str, frontend_urls: str | None = None) -> list[str]:
    origins: list[str] = []
    for origin in DEFAULT_ALLOWED_ORIGINS:
        append_unique_origin(origins, origin)

    append_unique_origin(origins, frontend_url)

    for origin in (frontend_urls or "").split(","):
        append_unique_origin(origins, origin)

    return origins


app = FastAPI(
    title="Expiry Stock API",
    version="0.1.0",
)

allowed_origins = build_allowed_origins(settings.frontend_url, settings.frontend_urls)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=CORS_ORIGIN_REGEX,
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
