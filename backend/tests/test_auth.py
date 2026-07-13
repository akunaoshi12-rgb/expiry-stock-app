import pytest

from app.core.auth import AuthService, AuthorizationError
from app.repositories.profiles import ProfileRepositoryError


class FakeVerifier:
    def verify(self, token: str) -> dict[str, object]:
        return {
            "id": "user-1",
            "email": "staff@example.com",
        }


class FakeProfiles:
    def __init__(self, profile: dict[str, object] | None, fail: bool = False) -> None:
        self.profile = profile
        self.fail = fail

    def get_by_id(self, user_id: str) -> dict[str, object] | None:
        if self.fail:
            raise ProfileRepositoryError("missing profiles table")
        return self.profile


def test_missing_profile_is_forbidden() -> None:
    service = AuthService(verifier=FakeVerifier(), profiles=FakeProfiles(profile=None))  # type: ignore[arg-type]

    with pytest.raises(AuthorizationError):
        service.authenticate("Bearer valid-token")


def test_profile_lookup_error_is_forbidden() -> None:
    service = AuthService(verifier=FakeVerifier(), profiles=FakeProfiles(profile=None, fail=True))  # type: ignore[arg-type]

    with pytest.raises(AuthorizationError):
        service.authenticate("Bearer valid-token")


def test_inactive_profile_is_forbidden() -> None:
    service = AuthService(  # type: ignore[arg-type]
        verifier=FakeVerifier(),
        profiles=FakeProfiles(profile={"id": "user-1", "role": "staff", "is_active": False}),
    )

    with pytest.raises(AuthorizationError):
        service.authenticate("Bearer valid-token")


def test_admin_profile_is_preserved() -> None:
    service = AuthService(  # type: ignore[arg-type]
        verifier=FakeVerifier(),
        profiles=FakeProfiles(profile={"id": "user-1", "role": "admin", "is_active": True}),
    )

    user = service.authenticate("Bearer valid-token")

    assert user.role == "admin"
