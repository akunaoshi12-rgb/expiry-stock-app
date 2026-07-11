"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getProductBatches } from "@/lib/api";
import { formatDate, formatUpdatedAt, getDaysLeft, getExpiryStatus, STATUS_OPTIONS } from "@/lib/status";
import type { ExpiryStatus, ProductBatchWithProduct } from "@/types";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/state-panels";
import { StatusBadge } from "@/components/status-badge";

type StatusFilter = ExpiryStatus | "all";
type SortMode = "nearest" | "stock-high";

export function ExpiryList() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("nearest");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [batches, setBatches] = useState<ProductBatchWithProduct[]>([]);

  const loadBatches = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setErrorMessage("");

    try {
      const data = await getProductBatches();
      setBatches(data);
    } catch (error) {
      setBatches([]);
      setErrorMessage(error instanceof Error ? error.message : "Daftar batch belum dapat dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBatches(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadBatches]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          batches
            .map((batch) => batch.product?.category?.name)
            .filter((item): item is string => Boolean(item))
        )
      ).sort(),
    [batches]
  );

  const filteredBatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return batches
      .filter((batch) => {
        const productName = batch.product?.name.toLowerCase() ?? "";
        const matchesQuery =
          normalizedQuery.length === 0 ||
          productName.includes(normalizedQuery) ||
          (batch.product?.barcode?.includes(normalizedQuery) ?? false) ||
          (batch.batch_number?.toLowerCase().includes(normalizedQuery) ?? false);
        const batchStatus = getExpiryStatus(batch.expiry_date);
        const matchesStatus = status === "all" || batchStatus === status;
        const productCategory = batch.product?.category?.name ?? "-";
        const matchesCategory = category === "all" || productCategory === category;

        return matchesQuery && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (sortMode === "stock-high") {
          return b.quantity - a.quantity;
        }

        return getDaysLeft(a.expiry_date) - getDaysLeft(b.expiry_date);
      });
  }, [batches, category, query, sortMode, status]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (errorMessage) {
    return <ErrorState description={errorMessage} onRetry={() => void loadBatches()} />;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Daftar expired</p>
          <h2 className="mt-2 text-2xl font-bold text-text md:text-3xl">Batch produk</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Gunakan pencarian, filter status, dan kategori untuk menentukan prioritas pengecekan.
          </p>
        </div>
        <Link href="/expiry/new" className="btn-primary">
          + Tambah data
        </Link>
      </section>

      <section className="card p-4">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <label className="label" htmlFor="batch-search">
              Search
            </label>
            <input
              id="batch-search"
              className="field mt-2"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari produk, barcode, atau batch"
            />
          </div>
          <div>
            <label className="label" htmlFor="status-filter">
              Status
            </label>
            <select
              id="status-filter"
              className="field mt-2"
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="category-filter">
              Kategori
            </label>
            <select
              id="category-filter"
              className="field mt-2"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">Semua kategori</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="sort-mode">
              Sorting
            </label>
            <select
              id="sort-mode"
              className="field mt-2"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
            >
              <option value="nearest">Tanggal terdekat</option>
              <option value="stock-high">Stok terbesar</option>
            </select>
          </div>
        </div>
      </section>

      {filteredBatches.length === 0 ? (
        <EmptyState
          title="Belum ada data yang cocok."
          description="Ubah filter atau tambahkan pencatatan baru untuk mulai memantau stok."
          action={
            <Link href="/expiry/new" className="btn-primary">
              Tambah data
            </Link>
          }
        />
      ) : (
        <>
          <section className="hidden overflow-hidden rounded-lg border border-border bg-white md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-surface-soft text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Expired</th>
                  <th className="px-4 py-3">Stok</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="transition-colors hover:bg-surface-soft">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-text">{batch.product?.name ?? "Produk tidak ditemukan"}</p>
                      <p className="text-xs text-muted">{batch.product?.barcode ?? "-"}</p>
                    </td>
                    <td className="px-4 py-4 text-muted">{batch.product?.category?.name ?? "-"}</td>
                    <td className="px-4 py-4 font-semibold text-text">{formatDate(batch.expiry_date)}</td>
                    <td className="px-4 py-4 text-muted">{batch.quantity} pcs</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={getExpiryStatus(batch.expiry_date)} daysLeft={getDaysLeft(batch.expiry_date)} />
                    </td>
                    <td className="px-4 py-4 text-muted">{batch.batch_number ?? "-"}</td>
                    <td className="px-4 py-4 text-muted">{formatUpdatedAt(batch.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="space-y-3 md:hidden">
            {filteredBatches.map((batch) => (
              <article key={batch.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-text">{batch.product?.name ?? "Produk tidak ditemukan"}</h3>
                    <p className="mt-1 text-xs text-muted">{batch.product?.barcode ?? "-"}</p>
                  </div>
                  <StatusBadge status={getExpiryStatus(batch.expiry_date)} daysLeft={getDaysLeft(batch.expiry_date)} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted">Tanggal</dt>
                    <dd className="font-semibold text-text">{formatDate(batch.expiry_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Stok</dt>
                    <dd className="font-semibold text-text">{batch.quantity} pcs</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Kategori</dt>
                    <dd className="font-semibold text-text">{batch.product?.category?.name ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Batch</dt>
                    <dd className="font-semibold text-text">{batch.batch_number ?? "-"}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
