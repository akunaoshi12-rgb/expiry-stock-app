"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExpiryForm } from "@/components/expiry-form";
import { ErrorState, LoadingSkeleton } from "@/components/state-panels";
import { getProductBatch } from "@/lib/api";
import type { ProductBatchWithProduct } from "@/types";

export function ExpiryEdit({ batchId }: { batchId: string }) {
  const [batch, setBatch] = useState<ProductBatchWithProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadBatch() {
      try {
        const data = await getProductBatch(batchId);
        if (!isActive) {
          return;
        }
        setBatch(data);
        setErrorMessage("");
      } catch (error) {
        if (!isActive) {
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : "Detail batch belum dapat dimuat.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadBatch();

    return () => {
      isActive = false;
    };
  }, [batchId]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (errorMessage || !batch) {
    return <ErrorState description={errorMessage || "Batch tidak ditemukan."} />;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
      <section className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-primary">Edit data expired</p>
          <h2 className="mt-1 text-2xl font-semibold text-text md:text-3xl">Perbarui batch</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Ubah tanggal, stok, lokasi, nomor batch, atau catatan berdasarkan kondisi terbaru.
          </p>
        </div>

        <ExpiryForm mode="edit" batch={batch} />
      </section>

      <aside className="space-y-4">
        <div className="panel p-5">
          <h3 className="font-semibold text-text">Produk</h3>
          <p className="mt-2 text-sm font-semibold text-text">{batch.product?.name ?? "Produk tidak ditemukan"}</p>
          <p className="mt-1 text-sm text-muted">{batch.product?.barcode ?? "-"}</p>
        </div>
        <Link href="/expiry" className="btn-secondary w-full justify-center">
          Kembali ke daftar
        </Link>
      </aside>
    </div>
  );
}
