"use client";

import { useEffect, useState } from "react";
import { ProductSearch } from "@/components/product-search";
import { Spinner, Toast } from "@/components/state-panels";
import { createProductBatch } from "@/lib/api";
import type { Product } from "@/types";

interface FormState {
  selectedProduct: Product | null;
  expiryDate: string;
  quantity: string;
  receivedDate: string;
  batchNumber: string;
  storageLocation: string;
  notes: string;
}

const initialForm: FormState = {
  selectedProduct: null,
  expiryDate: "",
  quantity: "",
  receivedDate: "",
  batchNumber: "",
  storageLocation: "",
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

    if (form.quantity.trim() === "") {
      return "Jumlah stok wajib diisi.";
    }

    const quantityNumber = Number(form.quantity);

    if (!Number.isInteger(quantityNumber) || quantityNumber <= 0) {
      return "Jumlah stok harus bilangan bulat lebih dari 0.";
    }

    if (form.receivedDate && form.expiryDate < form.receivedDate) {
      return "Tanggal expired tidak boleh sebelum tanggal diterima.";
    }

    return "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const selectedProduct = form.selectedProduct;
    if (!selectedProduct) {
      setError("Pilih produk dari daftar hasil pencarian.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProductBatch({
        product_id: selectedProduct.id,
        batch_number: form.batchNumber.trim() || null,
        quantity: Number(form.quantity),
        received_date: form.receivedDate || null,
        expiry_date: form.expiryDate,
        storage_location: form.storageLocation.trim() || null,
        notes: form.notes.trim() || null
      });
      setToast("Batch berhasil ditambahkan.");
      setForm(initialForm);
    } catch {
      setError("Batch belum dapat disimpan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <ProductSearch
          selectedProduct={form.selectedProduct}
          onSelect={(product) => updateField("selectedProduct", product)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="received-date">
              Tanggal diterima
            </label>
            <input
              id="received-date"
              className="field mt-2"
              type="date"
              value={form.receivedDate}
              onChange={(event) => updateField("receivedDate", event.target.value)}
            />
          </div>

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
            <label className="label" htmlFor="quantity">
              Jumlah stok
            </label>
            <input
              id="quantity"
              className="field mt-2"
              min="1"
              inputMode="numeric"
              type="number"
              value={form.quantity}
              onChange={(event) => updateField("quantity", event.target.value)}
              placeholder="12"
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
              <label className="label" htmlFor="storage-location">
                Lokasi penyimpanan
              </label>
              <select
                id="storage-location"
                className="field mt-2"
                value={form.storageLocation}
                onChange={(event) => updateField("storageLocation", event.target.value)}
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
          {isSubmitting ? <Spinner label="Menyimpan" /> : "Simpan batch expired"}
        </button>
      </form>

      {toast ? <Toast message={toast} /> : null}
    </>
  );
}
