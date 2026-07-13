"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductSearch } from "@/components/product-search";
import { Spinner, Toast } from "@/components/state-panels";
import { createProductBatch, updateProductBatch } from "@/lib/api";
import type { Product, ProductBatchWithProduct } from "@/types";

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

function buildInitialForm(batch?: ProductBatchWithProduct | null): FormState {
  if (!batch) {
    return initialForm;
  }

  return {
    selectedProduct: batch.product,
    expiryDate: batch.expiry_date,
    quantity: String(batch.quantity),
    receivedDate: batch.received_date ?? "",
    batchNumber: batch.batch_number ?? "",
    storageLocation: batch.storage_location ?? "",
    notes: batch.notes ?? ""
  };
}

interface ExpiryFormProps {
  mode?: "create" | "edit";
  batch?: ProductBatchWithProduct | null;
}

export function ExpiryForm({ mode = "create", batch = null }: ExpiryFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => buildInitialForm(batch));
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptional, setShowOptional] = useState(mode === "edit");

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

    if (!form.receivedDate) {
      return "Tanggal diterima wajib diisi.";
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
      const payload = {
        product_id: selectedProduct.id,
        batch_number: form.batchNumber.trim() || null,
        quantity: Number(form.quantity),
        received_date: form.receivedDate || null,
        expiry_date: form.expiryDate,
        storage_location: form.storageLocation.trim() || null,
        notes: form.notes.trim() || null
      };

      if (mode === "edit" && batch) {
        await updateProductBatch(batch.id, {
          batch_number: payload.batch_number,
          quantity: payload.quantity,
          received_date: payload.received_date,
          expiry_date: payload.expiry_date,
          storage_location: payload.storage_location,
          notes: payload.notes
        });
      } else {
        await createProductBatch(payload);
        setForm(initialForm);
      }

      setToast(mode === "edit" ? "Batch berhasil diperbarui." : "Batch berhasil ditambahkan.");
      router.push("/expiry");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : mode === "edit"
            ? "Batch belum dapat diperbarui. Coba lagi."
            : "Batch belum dapat disimpan. Coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <section className="panel p-5">
          <ProductSearch
            selectedProduct={form.selectedProduct}
            onSelect={(product) => updateField("selectedProduct", product)}
          />
        </section>

        <section className="panel p-5">
          <div className="mb-4">
            <p className="font-semibold text-text">Detail batch</p>
            <p className="mt-1 text-sm text-muted">Isi tanggal dan stok yang akan dipantau.</p>
          </div>
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
        </section>

        <section className="panel overflow-hidden">
          <button
            className="flex w-full items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-surface-soft/70"
            type="button"
            aria-expanded={showOptional}
            onClick={() => setShowOptional((current) => !current)}
          >
            <span>
              <span className="block font-semibold text-text">Informasi opsional</span>
              <span className="mt-1 block text-sm text-muted">Nomor batch, lokasi, dan catatan rak.</span>
            </span>
            <ChevronDown className={`h-4 w-4 text-muted transition-transform ${showOptional ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>

          {showOptional ? (
            <div className="border-t border-border p-5">
              <div className="grid gap-4 sm:grid-cols-2">
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
          ) : null}
        </section>

        {error ? (
          <div className="rounded-lg border border-danger/30 bg-danger-soft p-3 text-sm font-semibold text-danger">
            {error}
          </div>
        ) : null}

        <div className="sticky bottom-20 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
          <button className="btn-primary w-full sm:w-auto" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Spinner label="Menyimpan" />
            ) : (
              <>
                <Save className="h-4 w-4" aria-hidden="true" />
                {mode === "edit" ? "Simpan perubahan" : "Simpan batch expired"}
              </>
            )}
          </button>
        </div>
      </form>

      {toast ? <Toast message={toast} /> : null}
    </>
  );
}
