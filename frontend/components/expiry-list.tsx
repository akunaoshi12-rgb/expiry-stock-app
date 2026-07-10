"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { categories, getBatchesWithProduct } from "@/lib/dummy-data";
import { formatDate, formatUpdatedAt, STATUS_OPTIONS } from "@/lib/status";
import type { ExpiryStatus } from "@/types";
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

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  const batches = useMemo(() => getBatchesWithProduct(), []);
  const hasError = query.trim().toLowerCase() === "error";

  const filteredBatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return batches
      .filter((batch) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          batch.product.name.toLowerCase().includes(normalizedQuery) ||
          batch.product.barcode.includes(normalizedQuery) ||
          batch.batchNumber?.toLowerCase().includes(normalizedQuery);
        const matchesStatus = status === "all" || batch.status === status;
        const matchesCategory = category === "all" || batch.product.category === category;

        return matchesQuery && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (sortMode === "stock-high") {
          return b.stock - a.stock;
        }

        return a.daysLeft - b.daysLeft;
      });
  }, [batches, category, query, sortMode, status]);

  if (isLoading) {
    return <LoadingSkeleton />;
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

      {hasError ? (
        <ErrorState description="Daftar expired belum dapat ditampilkan. Coba gunakan kata kunci lain." />
      ) : filteredBatches.length === 0 ? (
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
                      <p className="font-semibold text-text">{batch.product.name}</p>
                      <p className="text-xs text-muted">{batch.product.barcode}</p>
                    </td>
                    <td className="px-4 py-4 text-muted">{batch.product.category}</td>
                    <td className="px-4 py-4 font-semibold text-text">{formatDate(batch.expiryDate)}</td>
                    <td className="px-4 py-4 text-muted">{batch.stock} pcs</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={batch.status} daysLeft={batch.daysLeft} />
                    </td>
                    <td className="px-4 py-4 text-muted">{batch.batchNumber ?? "-"}</td>
                    <td className="px-4 py-4 text-muted">{formatUpdatedAt(batch.updatedAt)}</td>
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
                    <h3 className="font-semibold text-text">{batch.product.name}</h3>
                    <p className="mt-1 text-xs text-muted">{batch.product.barcode}</p>
                  </div>
                  <StatusBadge status={batch.status} daysLeft={batch.daysLeft} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted">Tanggal</dt>
                    <dd className="font-semibold text-text">{formatDate(batch.expiryDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Stok</dt>
                    <dd className="font-semibold text-text">{batch.stock} pcs</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Kategori</dt>
                    <dd className="font-semibold text-text">{batch.product.category}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Batch</dt>
                    <dd className="font-semibold text-text">{batch.batchNumber ?? "-"}</dd>
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
