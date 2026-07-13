import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExpiryForm } from "@/components/expiry-form";
import { createProductBatch, searchProducts, updateProductBatch } from "@/lib/api";
import type { ProductBatch } from "@/types";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

vi.mock("@/components/product-search", () => ({
  ProductSearch: ({
    selectedProduct,
    onSelect
  }: {
    selectedProduct: { name: string } | null;
    onSelect: (product: object | null) => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() =>
          onSelect({
            id: "11111111-1111-1111-1111-111111111111",
            barcode: "1005623",
            internal_code: null,
            name: "ALMOND MILK WITH QURMA CHOCO",
            category: {
              id: "cat-1",
              name: "GROWELL BAR"
            },
            is_active: true
          })
        }
      >
        Pilih produk test
      </button>
      <span>{selectedProduct?.name ?? "Belum memilih produk"}</span>
    </div>
  )
}));

vi.mock("@/lib/api", () => ({
  createProductBatch: vi.fn(),
  searchProducts: vi.fn(),
  updateProductBatch: vi.fn()
}));

const createProductBatchMock = vi.mocked(createProductBatch);
const searchProductsMock = vi.mocked(searchProducts);
const updateProductBatchMock = vi.mocked(updateProductBatch);

const createdBatch: ProductBatch = {
  id: "22222222-2222-2222-2222-222222222222",
  product_id: "11111111-1111-1111-1111-111111111111",
  batch_number: "BATCH-001",
  quantity: 12,
  received_date: "2026-07-11",
  expiry_date: "2026-10-31",
  storage_location: "Gudang A",
  notes: "Rak pendingin",
  is_active: true,
  created_at: "2026-07-11T08:00:00+00:00",
  updated_at: "2026-07-11T08:00:00+00:00"
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /pilih produk test/i }));
  await user.type(screen.getByLabelText(/tanggal diterima/i), "2026-07-11");
  await user.type(screen.getByLabelText(/jumlah stok/i), "12");
  await user.type(screen.getByLabelText(/tanggal expired/i), "2026-10-31");
}

beforeEach(() => {
  createProductBatchMock.mockResolvedValue(createdBatch);
  searchProductsMock.mockResolvedValue([]);
  updateProductBatchMock.mockResolvedValue({ ...createdBatch, product: null });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  pushMock.mockReset();
});

describe("ExpiryForm", () => {
  it("menolak submit tanpa produk", async () => {
    const user = userEvent.setup();
    render(<ExpiryForm />);

    await user.type(screen.getByLabelText(/jumlah stok/i), "12");
    await user.type(screen.getByLabelText(/tanggal expired/i), "2026-10-31");
    await user.click(screen.getByRole("button", { name: /simpan batch expired/i }));

    expect(screen.getByText("Pilih produk dari daftar hasil pencarian.")).toBeInTheDocument();
    expect(createProductBatchMock).not.toHaveBeenCalled();
  });

  it("menolak submit tanpa quantity", async () => {
    const user = userEvent.setup();
    render(<ExpiryForm />);

    await user.click(screen.getByRole("button", { name: /pilih produk test/i }));
    await user.type(screen.getByLabelText(/tanggal diterima/i), "2026-07-11");
    await user.type(screen.getByLabelText(/tanggal expired/i), "2026-10-31");
    await user.click(screen.getByRole("button", { name: /simpan batch expired/i }));

    expect(screen.getByText("Jumlah stok wajib diisi.")).toBeInTheDocument();
  });

  it("menolak submit tanpa tanggal diterima", async () => {
    const user = userEvent.setup();
    render(<ExpiryForm />);

    await user.click(screen.getByRole("button", { name: /pilih produk test/i }));
    await user.type(screen.getByLabelText(/jumlah stok/i), "12");
    await user.type(screen.getByLabelText(/tanggal expired/i), "2026-10-31");
    await user.click(screen.getByRole("button", { name: /simpan batch expired/i }));

    expect(screen.getByText("Tanggal diterima wajib diisi.")).toBeInTheDocument();
  });

  it("menolak submit tanpa expiry date", async () => {
    const user = userEvent.setup();
    render(<ExpiryForm />);

    await user.click(screen.getByRole("button", { name: /pilih produk test/i }));
    await user.type(screen.getByLabelText(/tanggal diterima/i), "2026-07-11");
    await user.type(screen.getByLabelText(/jumlah stok/i), "12");
    await user.click(screen.getByRole("button", { name: /simpan batch expired/i }));

    expect(screen.getByText("Tanggal expired wajib diisi.")).toBeInTheDocument();
  });

  it("menolak expiry sebelum received", async () => {
    const user = userEvent.setup();
    render(<ExpiryForm />);

    await user.click(screen.getByRole("button", { name: /pilih produk test/i }));
    await user.type(screen.getByLabelText(/tanggal diterima/i), "2026-10-31");
    await user.type(screen.getByLabelText(/tanggal expired/i), "2026-07-11");
    await user.type(screen.getByLabelText(/jumlah stok/i), "12");
    await user.click(screen.getByRole("button", { name: /simpan batch expired/i }));

    expect(screen.getByText("Tanggal expired tidak boleh sebelum tanggal diterima.")).toBeInTheDocument();
  });

  it("menampilkan loading state dan mencegah double submit", async () => {
    const user = userEvent.setup();
    const pending = deferred<ProductBatch>();
    createProductBatchMock.mockReturnValue(pending.promise);
    render(<ExpiryForm />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /simpan batch expired/i }));
    await user.click(screen.getByRole("button", { name: /menyimpan/i }));

    expect(screen.getByText(/menyimpan/i)).toBeInTheDocument();
    expect(createProductBatchMock).toHaveBeenCalledTimes(1);

    pending.resolve(createdBatch);
    await waitFor(() => expect(screen.getByText("Batch berhasil ditambahkan.")).toBeInTheDocument());
  });

  it("sukses memanggil API dengan payload benar dan reset form", async () => {
    const user = userEvent.setup();
    render(<ExpiryForm />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /informasi opsional/i }));
    await user.type(screen.getByLabelText(/nomor batch/i), "BATCH-001");
    await user.selectOptions(screen.getByLabelText(/lokasi penyimpanan/i), "Gudang belakang");
    await user.type(screen.getByLabelText(/catatan/i), "Rak pendingin");
    await user.click(screen.getByRole("button", { name: /simpan batch expired/i }));

    await waitFor(() => expect(createProductBatchMock).toHaveBeenCalledTimes(1));
    expect(createProductBatchMock).toHaveBeenCalledWith({
      product_id: "11111111-1111-1111-1111-111111111111",
      batch_number: "BATCH-001",
      quantity: 12,
      received_date: "2026-07-11",
      expiry_date: "2026-10-31",
      storage_location: "Gudang belakang",
      notes: "Rak pendingin"
    });
    expect(await screen.findByText("Batch berhasil ditambahkan.")).toBeInTheDocument();
    expect(screen.getByLabelText(/jumlah stok/i)).toHaveValue(null);
    expect(pushMock).toHaveBeenCalledWith("/expiry");
  });

  it("error tidak mereset form dan menampilkan pesan dari API", async () => {
    const user = userEvent.setup();
    createProductBatchMock.mockRejectedValue(new Error("Produk tidak aktif."));
    render(<ExpiryForm />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /simpan batch expired/i }));

    expect(await screen.findByText("Produk tidak aktif.")).toBeInTheDocument();
    expect(screen.getByLabelText(/jumlah stok/i)).toHaveValue(12);
  });
});
