from dataclasses import dataclass
from typing import Any, Literal

import httpx
from fastapi import Header

from app.core.config import Settings, get_settings
from app.core.errors import ApiErrorException
from app.repositories.profiles import ProfileRepository, ProfileRepositoryError

UserRole = Literal["staff", "admin"]


class AuthError(Exception):
    pass


class AuthorizationError(Exception):
    pass


@dataclass(frozen=True)
class AuthenticatedUser:
    id: str
    email: str | None
    role: UserRole


class SupabaseAuthVerifier:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()

    def verify(self, token: str) -> dict[str, Any]:
        if not self.settings.supabase_url:
            raise AuthError("Supabase URL is not configured.")

        api_key = self.settings.supabase_publishable_key or self.settings.supabase_service_role_key
        if not api_key:
            raise AuthError("Supabase auth key is not configured.")

        url = f"{self.settings.supabase_url.rstrip('/')}/auth/v1/user"
        headers = {
            "apikey": api_key,
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
        }

        try:
            with httpx.Client(timeout=self.settings.supabase_timeout_seconds) as client:
                response = client.get(url, headers=headers)
                response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code in {401, 403}:
                raise AuthError("Invalid Supabase access token.") from exc
            raise AuthError("Supabase auth request failed.") from exc
        except httpx.HTTPError as exc:
            raise AuthError("Supabase auth request failed.") from exc

        data = response.json()
        if not isinstance(data, dict) or not data.get("id"):
            raise AuthError("Supabase auth response was invalid.")
        return data


class AuthService:
    def __init__(
        self,
        verifier: SupabaseAuthVerifier | None = None,
        profiles: ProfileRepository | None = None,
    ) -> None:
        self.verifier = verifier or SupabaseAuthVerifier()
        self.profiles = profiles or ProfileRepository()

    def authenticate(self, authorization: str | None) -> AuthenticatedUser:
        token = self._read_bearer_token(authorization)
        user_data = self.verifier.verify(token)
        user_id = str(user_data["id"])

        try:
            profile = self.profiles.get_by_id(user_id)
        except ProfileRepositoryError as exc:
            raise AuthError("Profile lookup failed.") from exc

        if profile is None or not bool(profile.get("is_active")):
            raise AuthorizationError("User profile is inactive or missing.")

        role = str(profile.get("role", "staff"))
        if role not in {"staff", "admin"}:
            raise AuthorizationError("User role is invalid.")

        email = user_data.get("email")
        return AuthenticatedUser(
            id=user_id,
            email=email if isinstance(email, str) else None,
            role=role,  # type: ignore[arg-type]
        )

    def _read_bearer_token(self, authorization: str | None) -> str:
        if not authorization:
            raise AuthError("Missing Authorization header.")

        scheme, _, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or not token.strip():
            raise AuthError("Invalid Authorization header.")
        return token.strip()


def get_current_user(authorization: str | None = Header(default=None)) -> AuthenticatedUser:
    try:
        return AuthService().authenticate(authorization)
    except AuthError:
        raise ApiErrorException(
            code="UNAUTHORIZED",
            message="Sesi tidak valid atau sudah berakhir.",
            status_code=401,
        )
    except AuthorizationError:
        raise ApiErrorException(
            code="FORBIDDEN",
            message="Akun tidak memiliki akses ke fitur ini.",
            status_code=403,
        )


def require_admin(user: AuthenticatedUser) -> None:
    if user.role != "admin":
        raise ApiErrorException(
            code="FORBIDDEN",
            message="Aksi ini hanya dapat dilakukan admin.",
            status_code=403,
        )
