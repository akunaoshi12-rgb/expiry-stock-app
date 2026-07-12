import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExpiryList } from "@/components/expiry-list";
import { deleteProductBatch, getProductBatches } from "@/lib/api";
import { getSupabaseClient } from "@/lib/supabase";
import type { ProductBatchWithProduct } from "@/types";

vi.mock("@/lib/api", () => ({
  deleteProductBatch: vi.fn(),
  getProductBatches: vi.fn()
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseClient: vi.fn(),
  getUserRole: () => "admin"
}));

const getProductBatchesMock = vi.mocked(getProductBatches);
const deleteProductBatchMock = vi.mocked(deleteProductBatch);
const getSupabaseClientMock = vi.mocked(getSupabaseClient);

const batch: ProductBatchWithProduct = {
  id: "batch-1",
  product_id: "product-1",
  batch_number: "BATCH-001",
  quantity: 12,
  received_date: "2026-07-11",
  expiry_date: "2026-10-31",
  storage_location: "Gudang A",
  notes: null,
  is_active: true,
  created_at: "2026-07-11T08:00:00+00:00",
  updated_at: "2026-07-11T08:00:00+00:00",
  product: {
    id: "product-1",
    barcode: "1005623",
    internal_code: null,
    name: "ALMOND MILK",
    category: {
      id: "cat-1",
      name: "GROWELL BAR"
    },
    is_active: true
  }
};

beforeEach(() => {
  getProductBatchesMock.mockResolvedValue([batch]);
  deleteProductBatchMock.mockResolvedValue(batch);
  getSupabaseClientMock.mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { app_metadata: { role: "admin" } } } })
    }
  } as never);
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("ExpiryList", () => {
  it("menampilkan link edit untuk batch", async () => {
    render(<ExpiryList />);

    expect((await screen.findAllByText("ALMOND MILK"))[0]).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /edit/i })[0]).toHaveAttribute("href", "/expiry/batch-1/edit");
  });

  it("admin dapat menghapus batch dengan konfirmasi", async () => {
    const user = userEvent.setup();
    render(<ExpiryList />);

    await screen.findAllByText("ALMOND MILK");
    await user.click(screen.getAllByRole("button", { name: /hapus/i })[0]);

    await waitFor(() => expect(deleteProductBatchMock).toHaveBeenCalledWith("batch-1"));
    expect(await screen.findByText("Batch berhasil dihapus.")).toBeInTheDocument();
  });
});
