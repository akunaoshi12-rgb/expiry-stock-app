import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExpiryList } from "@/components/expiry-list";
import { deleteProductBatch, getProductBatches } from "@/lib/api";
import type { ProductBatchWithProduct } from "@/types";

vi.mock("@/lib/api", () => ({
  deleteProductBatch: vi.fn(),
  getProductBatches: vi.fn()
}));

const getProductBatchesMock = vi.mocked(getProductBatches);
const deleteProductBatchMock = vi.mocked(deleteProductBatch);

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
    expect(screen.getAllByRole("button", { name: /hapus/i })[0]).toBeInTheDocument();
  });

  it("user dapat menghapus batch dengan konfirmasi", async () => {
    const user = userEvent.setup();
    render(<ExpiryList />);

    await screen.findAllByText("ALMOND MILK");
    await user.click(screen.getAllByRole("button", { name: /hapus/i })[0]);

    const dialog = screen.getByRole("dialog", { name: /hapus batch stok/i });
    expect(within(dialog).getByText("ALMOND MILK")).toBeInTheDocument();
    expect(within(dialog).getByText("BATCH-001")).toBeInTheDocument();
    expect(within(dialog).getByText("31 Okt 2026")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: /hapus batch/i }));

    await waitFor(() => expect(deleteProductBatchMock).toHaveBeenCalledWith("batch-1"));
    expect(await screen.findByText("Batch berhasil dihapus.")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("menampilkan error di modal jika hapus gagal", async () => {
    deleteProductBatchMock.mockRejectedValue(new Error("Batch belum dapat dihapus."));
    const user = userEvent.setup();
    render(<ExpiryList />);

    await screen.findAllByText("ALMOND MILK");
    await user.click(screen.getAllByRole("button", { name: /hapus/i })[0]);

    const dialog = screen.getByRole("dialog", { name: /hapus batch stok/i });
    await user.click(within(dialog).getByRole("button", { name: /hapus batch/i }));

    expect(await within(dialog).findByText("Batch belum dapat dihapus.")).toBeInTheDocument();
    expect(screen.getAllByText("ALMOND MILK")[0]).toBeInTheDocument();
  });
});
