import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExpiryForm } from "@/components/expiry-form";
import { searchProducts } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  searchProducts: vi.fn()
}));

const searchProductsMock = vi.mocked(searchProducts);

beforeEach(() => {
  searchProductsMock.mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
});

describe("ExpiryForm", () => {
  it("menolak submit jika user hanya mengetik produk tanpa memilih product id valid", async () => {
    const user = userEvent.setup();
    render(<ExpiryForm />);

    await user.type(
      screen.getByRole("combobox", {
        name: /cari nama produk, barcode, atau kode internal/i
      }),
      "almond"
    );
    await user.type(screen.getByLabelText(/tanggal expired/i), "2026-08-01");
    await user.type(screen.getByLabelText(/sisa stok/i), "5");
    await user.click(screen.getByRole("button", { name: /simpan data expired/i }));

    expect(screen.getByText("Pilih produk dari daftar hasil pencarian.")).toBeInTheDocument();
  });
});
