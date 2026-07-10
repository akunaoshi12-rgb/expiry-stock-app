import { render, screen, waitFor } from "@testing-library/react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductSearch } from "@/components/product-search";
import type { Product } from "@/types";
import { searchProducts } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  searchProducts: vi.fn()
}));

const searchProductsMock = vi.mocked(searchProducts);

const almondProduct: Product = {
  id: "prd-1",
  barcode: "089686123456",
  internal_code: null,
  name: "ALMOND MILK WITH QURMA CHOCO",
  category: {
    id: "cat-1",
    name: "GROWELL BAR"
  },
  is_active: true
};

const internalCodeProduct: Product = {
  id: "prd-2",
  barcode: null,
  internal_code: "INT-001",
  name: "INTERNAL PRODUCT",
  category: null,
  is_active: true
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });

  return { promise, resolve };
}

function renderProductSearch(onSelect = vi.fn()) {
  render(<ProductSearch selectedProduct={null} onSelect={onSelect} />);
  return {
    input: screen.getByRole("combobox", {
      name: /cari nama produk, barcode, atau kode internal/i
    }),
    onSelect
  };
}

function waitForDebounce() {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 350);
  });
}

beforeEach(() => {
  searchProductsMock.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("ProductSearch", () => {
  it("tidak memanggil API untuk input kurang dari 2 karakter", async () => {
    const user = userEvent.setup();
    const { input } = renderProductSearch();

    await user.type(input, "a");
    await waitForDebounce();

    expect(searchProductsMock).not.toHaveBeenCalled();
  });

  it("menjalankan debounce sebelum memanggil API", async () => {
    const user = userEvent.setup();
    searchProductsMock.mockResolvedValue([almondProduct]);
    const { input } = renderProductSearch();

    await user.type(input, "almond");
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    expect(searchProductsMock).not.toHaveBeenCalled();

    await new Promise((resolve) => window.setTimeout(resolve, 100));
    await waitFor(() => expect(searchProductsMock).toHaveBeenCalledTimes(1));
    expect(searchProductsMock).toHaveBeenCalledWith("almond", expect.any(AbortSignal));
  });

  it("menampilkan loading state", async () => {
    const user = userEvent.setup();
    searchProductsMock.mockReturnValue(deferred<Product[]>().promise);
    const { input } = renderProductSearch();

    await user.type(input, "almond");
    await waitForDebounce();

    expect(await screen.findByText(/mencari produk/i)).toBeInTheDocument();
  });

  it("menampilkan hasil pencarian", async () => {
    const user = userEvent.setup();
    searchProductsMock.mockResolvedValue([almondProduct]);
    const { input } = renderProductSearch();

    await user.type(input, "almond");
    await waitForDebounce();

    expect(await screen.findByText("ALMOND MILK WITH QURMA CHOCO")).toBeInTheDocument();
    expect(screen.getByText(/Barcode 089686123456/)).toBeInTheDocument();
    expect(screen.getByText(/GROWELL BAR/)).toBeInTheDocument();
  });

  it("menampilkan empty state", async () => {
    const user = userEvent.setup();
    searchProductsMock.mockResolvedValue([]);
    const { input } = renderProductSearch();

    await user.type(input, "zzzz");
    await waitForDebounce();

    expect(await screen.findByText("Tidak ada produk ditemukan.")).toBeInTheDocument();
  });

  it("menampilkan error state tanpa detail internal", async () => {
    const user = userEvent.setup();
    searchProductsMock.mockRejectedValue(new Error("internal stack trace"));
    const { input } = renderProductSearch();

    await user.type(input, "almond");
    await waitForDebounce();

    expect(await screen.findByText("Gagal mencari produk. Coba lagi.")).toBeInTheDocument();
    expect(screen.queryByText(/internal stack trace/i)).not.toBeInTheDocument();
  });

  it("mendukung keyboard navigation dan memilih hasil", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    searchProductsMock.mockResolvedValue([almondProduct, internalCodeProduct]);
    const { input } = renderProductSearch(onSelect);

    await user.type(input, "almond");
    await waitForDebounce();
    await screen.findByText("ALMOND MILK WITH QURMA CHOCO");

    await user.keyboard("{ArrowDown}{Enter}");

    expect(onSelect).toHaveBeenCalledWith(internalCodeProduct);
  });

  it("memilih hasil menyimpan product id melalui callback", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    searchProductsMock.mockResolvedValue([almondProduct]);
    const { input } = renderProductSearch(onSelect);

    await user.type(input, "almond");
    await waitForDebounce();
    await user.click(await screen.findByText("ALMOND MILK WITH QURMA CHOCO"));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "prd-1" }));
  });

  it("mengubah input setelah memilih menghapus selected product", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ProductSearch selectedProduct={almondProduct} onSelect={onSelect} />);
    const input = screen.getByRole("combobox", {
      name: /cari nama produk, barcode, atau kode internal/i
    });

    await user.clear(input);
    await user.type(input, "almond baru");

    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("tidak menampilkan teks null untuk metadata kosong", async () => {
    const user = userEvent.setup();
    searchProductsMock.mockResolvedValue([internalCodeProduct]);
    const { input } = renderProductSearch();

    await user.type(input, "internal");
    await waitForDebounce();
    await screen.findByText("INTERNAL PRODUCT");

    expect(screen.queryByText(/null/i)).not.toBeInTheDocument();
  });

  it("membatalkan request lama agar hasil lama tidak menimpa hasil terbaru", async () => {
    const user = userEvent.setup();
    const first = deferred<Product[]>();
    const second = deferred<Product[]>();
    searchProductsMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { input } = renderProductSearch();

    await user.type(input, "almond");
    await waitForDebounce();
    await user.clear(input);
    await user.type(input, "milk");
    await waitForDebounce();

    second.resolve([internalCodeProduct]);
    first.resolve([almondProduct]);

    expect(await screen.findByText("INTERNAL PRODUCT")).toBeInTheDocument();
    expect(screen.queryByText("ALMOND MILK WITH QURMA CHOCO")).not.toBeInTheDocument();
    expect(searchProductsMock.mock.calls[0]?.[1]?.aborted).toBe(true);
  });
});
