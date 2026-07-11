import os

import pytest

from app.services.product_search import ProductSearchDatabaseError, ProductSearchService


@pytest.mark.skipif(
    not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
    reason="Supabase development credentials are not available.",
)
def test_product_search_with_supabase_development_credentials() -> None:
    try:
        results = ProductSearchService().search("almond", 10)
    except ProductSearchDatabaseError:
        pytest.skip("Supabase is not reachable from this test environment.")

    assert len(results) <= 10
    assert all(item.is_active for item in results)
