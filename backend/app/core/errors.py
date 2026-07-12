from typing import Any

from fastapi.responses import JSONResponse


class ApiErrorException(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}


def error_response(
    code: str,
    message: str,
    status_code: int,
    details: dict[str, Any] | None = None,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "data": None,
            "error": {
                "code": code,
                "message": message,
                "details": details or {},
            },
        },
    )


def api_error_response(error: ApiErrorException) -> JSONResponse:
    return error_response(
        code=error.code,
        message=error.message,
        status_code=error.status_code,
        details=error.details,
    )
