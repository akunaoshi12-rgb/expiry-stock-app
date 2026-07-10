"use client";

import { useEffect, useState } from "react";
import { ProductSearch } from "@/components/product-search";
import { Spinner, Toast } from "@/components/state-panels";
import type { Product } from "@/types";

interface FormState {
  selectedProduct: Product | null;
  expiryDate: string;
  stock: string;
  batchNumber: string;
  location: string;
  notes: string;
}

const initialForm: FormState = {
  selectedProduct: null,
  expiryDate: "",
  stock: "",
  batchNumber: "",
  location: "",
  notes: ""
};

export function ExpiryForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function updateField(field: keyof FormState, value: string | Product | null) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function validateForm() {
    if (!form.selectedProduct?.id) {
      return "Pilih produk dari daftar hasil pencarian.";
    }

    if (!form.expiryDate) {
      return "Tanggal expired wajib diisi.";
    }

    if (form.stock.trim() === "") {
      return "Sisa stok wajib diisi.";
    }

    const stockNumber = Number(form.stock);

    if (!Number.isInteger(stockNumber) || stockNumber < 0) {
      return "Sisa stok harus bilangan bulat dan tidak boleh kurang dari 0.";
    }

    return "";
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      setToast("Data expired berhasil disimpan.");
      setForm(initialForm);
    }, 700);
  }

  return (
    <>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <ProductSearch
          selectedProduct={form.selectedProduct}
          onSelect={(product) => updateField("selectedProduct", product)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="expiry-date">
              Tanggal expired
            </label>
            <input
              id="expiry-date"
              className="field mt-2"
              type="date"
              value={form.expiryDate}
              onChange={(event) => updateField("expiryDate", event.target.value)}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="stock">
              Sisa stok
            </label>
            <input
              id="stock"
              className="field mt-2"
              min="0"
              inputMode="numeric"
              type="number"
              value={form.stock}
              onChange={(event) => updateField("stock", event.target.value)}
              placeholder="0"
              required
            />
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <p className="text-sm font-semibold text-primary">Informasi opsional</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="batch-number">
                Nomor batch
              </label>
              <input
                id="batch-number"
                className="field mt-2"
                value={form.batchNumber}
                onChange={(event) => updateField("batchNumber", event.target.value)}
                placeholder="Contoh: BATCH-001"
              />
            </div>

            <div>
              <label className="label" htmlFor="location">
                Lokasi
              </label>
              <select
                id="location"
                className="field mt-2"
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
              >
                <option value="">Pilih lokasi</option>
                <option value="Rak depan">Rak depan</option>
                <option value="Chiller 1">Chiller 1</option>
                <option value="Chiller 2">Chiller 2</option>
                <option value="Gudang belakang">Gudang belakang</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="label" htmlFor="notes">
              Catatan
            </label>
            <textarea
              id="notes"
              className="field mt-2 min-h-28 py-3"
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Tambahkan kondisi produk atau arahan penanganan."
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-danger/30 bg-red-50 p-3 text-sm font-semibold text-danger">
            {error}
          </div>
        ) : null}

        <button className="btn-primary w-full sm:w-auto" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner label="Menyimpan" /> : "Simpan data expired"}
        </button>
      </form>

      {toast ? <Toast message={toast} /> : null}
    </>
  );
}
