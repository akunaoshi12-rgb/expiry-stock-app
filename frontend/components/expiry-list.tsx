"use client";

import Link from "next/link";
import { ChevronDown, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteProductBatch, getProductBatches } from "@/lib/api";
import { formatDate, formatUpdatedAt, getDaysLeft, getExpiryStatus, STATUS_ACCENT_CLASS, STATUS_OPTIONS } from "@/lib/status";
import type { ExpiryStatus, ProductBatchWithProduct } from "@/types";
import { EmptyState, ErrorState, LoadingSkeleton, Spinner, Toast } from "@/components/state-panels";
import { StatusBadge } from "@/components/status-badge";

type StatusFilter = ExpiryStatus | "all";
type SortMode = "nearest" | "stock-high";
const statusValues: StatusFilter[] = ["all", "expired", "critical", "warning", "safe"];

function readStatusParam(value: string | null): StatusFilter {
  return statusValues.includes(value as StatusFilter) ? (value as StatusFilter) : "all";
}

export function ExpiryList() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("nearest");
  const [expandedBatchId, setExpandedBatchId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [toast, setToast] = useState("");
  const [batches, setBatches] = useState<ProductBatchWithProduct[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<ProductBatchWithProduct | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStatus(readStatusParam(new URLSearchParams(window.location.search).get("status")));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

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

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function openDeleteDialog(batch: ProductBatchWithProduct) {
    setDeleteTarget(batch);
    setDeleteErrorMessage("");
  }

  function closeDeleteDialog() {
    if (isDeletingId) {
      return;
    }
    setDeleteTarget(null);
    setDeleteErrorMessage("");
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeletingId(deleteTarget.id);
    setDeleteErrorMessage("");
    try {
      await deleteProductBatch(deleteTarget.id);
      setBatches((current) => current.filter((item) => item.id !== deleteTarget.id));
      setExpandedBatchId((current) => (current === deleteTarget.id ? "" : current));
      setToast("Batch berhasil dihapus.");
      setDeleteTarget(null);
    } catch (error) {
      setDeleteErrorMessage(error instanceof Error ? error.message : "Batch belum dapat dihapus.");
    } finally {
      setIsDeletingId("");
    }
  }

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
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-primary">Daftar expired</p>
          <h2 className="mt-1 text-2xl font-semibold text-text md:text-3xl">Audit batch stok</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Cek batch paling dekat expired, stok tersisa, dan riwayat update dalam satu tampilan.
          </p>
        </div>
        <Link href="/expiry/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah data
        </Link>
      </section>

      <section className="panel p-4">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <label className="label" htmlFor="batch-search">
              Cari
            </label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                id="batch-search"
                className="field pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Produk, barcode, atau batch"
              />
            </div>
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
          <section className="panel hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1060px] border-separate border-spacing-y-1 p-2 text-left text-sm">
              <thead className="text-xs font-semibold text-muted">
                <tr>
                  <th className="px-3 py-2">Produk</th>
                  <th className="px-3 py-2">Kategori</th>
                  <th className="px-3 py-2">Expired</th>
                  <th className="px-3 py-2">Stok</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Batch</th>
                  <th className="px-3 py-2">Update</th>
                  <th className="w-44 px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="rounded-lg transition-colors odd:bg-surface-soft/70 hover:bg-surface-soft">
                    <td className={`rounded-l-lg border-l-4 px-3 py-3 ${STATUS_ACCENT_CLASS[getExpiryStatus(batch.expiry_date)]}`}>
                      <p className="font-semibold text-text">{batch.product?.name ?? "Produk tidak ditemukan"}</p>
                      <p className="text-xs text-muted">{batch.product?.barcode ?? "-"}</p>
                    </td>
                    <td className="px-3 py-3 text-muted">{batch.product?.category?.name ?? "-"}</td>
                    <td className="px-3 py-3 font-semibold text-text">{formatDate(batch.expiry_date)}</td>
                    <td className="px-3 py-3 text-muted">{batch.quantity} pcs</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={getExpiryStatus(batch.expiry_date)} daysLeft={getDaysLeft(batch.expiry_date)} />
                    </td>
                    <td className="px-3 py-3 text-muted">{batch.batch_number ?? "-"}</td>
                    <td className="px-3 py-3 text-muted">{formatUpdatedAt(batch.updated_at)}</td>
                    <td className="rounded-r-lg px-3 py-3">
                      <div className="flex gap-2">
                        <Link href={`/expiry/${batch.id}/edit`} className="btn-secondary min-h-9 whitespace-nowrap px-3 py-1">
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          Edit
                        </Link>
                        <button
                          className="btn-secondary min-h-9 whitespace-nowrap border-danger/30 bg-danger-soft px-3 py-1 text-danger hover:bg-danger-soft/80"
                          type="button"
                          disabled={isDeletingId === batch.id}
                          onClick={() => openDeleteDialog(batch)}
                        >
                          {isDeletingId === batch.id ? (
                            <Spinner label="Hapus" />
                          ) : (
                            <>
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              Hapus
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="space-y-3 md:hidden">
            {filteredBatches.map((batch) => {
              const expanded = expandedBatchId === batch.id;

              return (
              <article key={batch.id} className={`panel overflow-hidden border-l-4 ${STATUS_ACCENT_CLASS[getExpiryStatus(batch.expiry_date)]}`}>
                <button
                  className="flex w-full items-start justify-between gap-3 p-4 text-left"
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setExpandedBatchId(expanded ? "" : batch.id)}
                >
                  <div className="min-w-0">
                    <h3 className="font-semibold text-text">{batch.product?.name ?? "Produk tidak ditemukan"}</h3>
                    <p className="mt-1 text-xs text-muted">
                      {formatDate(batch.expiry_date)} · {batch.quantity} pcs
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={getExpiryStatus(batch.expiry_date)} daysLeft={getDaysLeft(batch.expiry_date)} />
                    <ChevronDown className={`h-4 w-4 text-muted transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
                  </div>
                </button>

                {expanded ? (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-muted">Barcode</dt>
                        <dd className="font-semibold text-text">{batch.product?.barcode ?? "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Kategori</dt>
                        <dd className="font-semibold text-text">{batch.product?.category?.name ?? "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Batch</dt>
                        <dd className="font-semibold text-text">{batch.batch_number ?? "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Update</dt>
                        <dd className="font-semibold text-text">{formatUpdatedAt(batch.updated_at)}</dd>
                      </div>
                    </dl>
                    <div className="mt-4 flex gap-2">
                      <Link href={`/expiry/${batch.id}/edit`} className="btn-secondary flex-1 justify-center">
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Edit
                      </Link>
                      <button
                        className="btn-secondary flex-1 justify-center border-danger/30 bg-danger-soft text-danger hover:bg-danger-soft/80"
                        type="button"
                        disabled={isDeletingId === batch.id}
                        onClick={() => openDeleteDialog(batch)}
                      >
                        {isDeletingId === batch.id ? (
                          <Spinner label="Hapus" />
                        ) : (
                          <>
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Hapus
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
              );
            })}
          </section>
        </>
      )}
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 px-4 py-5 backdrop-blur-[2px] md:items-center">
          <div
            className="w-full max-w-md rounded-lg border border-border bg-white shadow-soft"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-batch-title"
          >
            <div className="border-b border-border px-5 py-4">
              <p className="text-xs font-semibold uppercase text-danger">Konfirmasi hapus</p>
              <h3 id="delete-batch-title" className="mt-1 text-lg font-semibold text-text">
                Hapus batch stok?
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Batch akan disembunyikan dari daftar aktif dan tetap tercatat sebagai data audit.
              </p>
            </div>
            <dl className="grid gap-3 px-5 py-4 text-sm">
              <div className="grid grid-cols-[7rem_1fr] gap-3">
                <dt className="text-muted">Produk</dt>
                <dd className="font-semibold text-text">{deleteTarget.product?.name ?? "Produk tidak ditemukan"}</dd>
              </div>
              <div className="grid grid-cols-[7rem_1fr] gap-3">
                <dt className="text-muted">Batch code</dt>
                <dd className="font-semibold text-text">{deleteTarget.batch_number ?? "-"}</dd>
              </div>
              <div className="grid grid-cols-[7rem_1fr] gap-3">
                <dt className="text-muted">Expired</dt>
                <dd className="font-semibold text-text">{formatDate(deleteTarget.expiry_date)}</dd>
              </div>
            </dl>
            {deleteErrorMessage ? (
              <div className="mx-5 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-semibold text-danger">
                {deleteErrorMessage}
              </div>
            ) : null}
            <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
              <button className="btn-secondary" type="button" onClick={closeDeleteDialog} disabled={Boolean(isDeletingId)}>
                Batal
              </button>
              <button className="btn-primary bg-danger hover:bg-danger/90" type="button" onClick={() => void confirmDelete()} disabled={Boolean(isDeletingId)}>
                {isDeletingId ? (
                  <Spinner label="Menghapus" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Hapus batch
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {toast ? <Toast message={toast} /> : null}
    </div>
  );
}
