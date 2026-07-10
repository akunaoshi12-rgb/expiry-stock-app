import os
import pytest

from app.schemas.product_batches import ProductBatchCreateRequest
from app.services.product_batches import ProductBatchService


@pytest.mark.skipif(
    not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
    reason="Supabase development credentials are not available.",
)
def test_create_batch_with_supabase_development_credentials() -> None:
    product_id = os.getenv("TEST_PRODUCT_ID")
    if not product_id:
        pytest.skip("TEST_PRODUCT_ID is not configured.")

    payload = ProductBatchCreateRequest(
        product_id=product_id,
        batch_number="TEST-BATCH",
        quantity=1,
        received_date=None,
        expiry_date="2026-10-31",
        storage_location="Test",
        notes="Integration test",
    )

    result = ProductBatchService().create_batch(payload)

    assert result.product_id == product_id
    assert result.quantity == 1
