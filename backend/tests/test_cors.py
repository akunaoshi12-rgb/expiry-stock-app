import re

from app.main import CORS_ORIGIN_REGEX, build_allowed_origins


def test_build_allowed_origins_keeps_defaults_and_env_values() -> None:
    origins = build_allowed_origins(
        " https://custom.example.com/ ",
        "https://one.example.com, https://two.example.com/ , https://one.example.com",
    )

    assert "http://127.0.0.1:3000" in origins
    assert "http://localhost:3000" in origins
    assert "https://expiry-stock-app-git-main-tech-me.vercel.app" in origins
    assert "https://custom.example.com" in origins
    assert "https://two.example.com" in origins
    assert origins.count("https://one.example.com") == 1


def test_cors_origin_regex_allows_frontend_vercel_aliases() -> None:
    assert re.fullmatch(
        CORS_ORIGIN_REGEX,
        "https://expiry-stock-app-git-main-tech-me.vercel.app",
    )
    assert re.fullmatch(
        CORS_ORIGIN_REGEX,
        "https://expiry-stock-9h7saflrh-tech-me.vercel.app",
    )


def test_cors_origin_regex_rejects_unrelated_vercel_aliases() -> None:
    assert not re.fullmatch(
        CORS_ORIGIN_REGEX,
        "https://expiry-stock-api-git-main-tech-me.vercel.app",
    )
    assert not re.fullmatch(CORS_ORIGIN_REGEX, "https://example.vercel.app")
