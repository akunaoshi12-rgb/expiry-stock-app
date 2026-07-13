"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, ListChecks, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getDashboardSummary, getProductBatches } from "@/lib/api";
import { formatDate, getDaysLeft, getExpiryStatus, STATUS_ACCENT_CLASS } from "@/lib/status";
import type { DashboardSummary, ProductBatchWithProduct } from "@/types";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/state-panels";
import { StatusBadge } from "@/components/status-badge";

export function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [batches, setBatches] = useState<ProductBatchWithProduct[]>([]);

  const applyDashboardRequest = useCallback(async () => {
    try {
      const [summaryData, batchData] = await Promise.all([getDashboardSummary(), getProductBatches()]);
      setDashboardSummary(summaryData);
      setBatches(batchData);
    } catch (error) {
      setDashboardSummary(null);
      setBatches([]);
      setErrorMessage(error instanceof Error ? error.message : "Ringkasan dashboard belum dapat ditampilkan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInitialDashboardSummary() {
      try {
        const [summaryData, batchData] = await Promise.all([getDashboardSummary(), getProductBatches()]);

        if (!isActive) {
          return;
        }

        setDashboardSummary(summaryData);
        setBatches(batchData);
        setErrorMessage("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setDashboardSummary(null);
        setBatches([]);
        setErrorMessage(error instanceof Error ? error.message : "Ringkasan dashboard belum dapat ditampilkan.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialDashboardSummary();

    return () => {
      isActive = false;
    };
  }, []);

  const summary = useMemo(() => {
    if (!dashboardSummary) {
      return [];
    }

    return [
      {
        label: "Expired",
        value: dashboardSummary.expired_batches,
        caption: "Tanggal sudah lewat",
        tone: "text-danger"
      },
      {
        label: "Dalam 7 hari",
        value: dashboardSummary.within_7_days_batches,
        caption: "Perlu dicek cepat",
        tone: "text-warning"
      },
      {
        label: "Total batch aktif",
        value: dashboardSummary.active_batches,
        caption: "Masih dipantau",
        tone: "text-primary"
      }
    ];
  }, [dashboardSummary]);

  const nearestBatches = useMemo(
    () => [...batches].sort((a, b) => getDaysLeft(a.expiry_date) - getDaysLeft(b.expiry_date)).slice(0, 6),
    [batches]
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (errorMessage) {
    return (
      <ErrorState
        description={errorMessage}
        onRetry={() => {
          setIsLoading(true);
          setErrorMessage("");
          void applyDashboardRequest();
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-primary">Dashboard</p>
          <h2 className="mt-1 text-2xl font-semibold text-text md:text-3xl">Prioritas hari ini</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Batch paling dekat expired tampil lebih dulu supaya pengecekan bisa langsung dimulai.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/expiry?status=critical" className="btn-primary">
            <ListChecks className="h-4 w-4" aria-hidden="true" />
            Lihat batch kritis
          </Link>
          <Link href="/expiry/new" className="btn-secondary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah data
          </Link>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b border-border bg-white p-4 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-soft px-2.5 py-1 text-xs font-semibold text-primary">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              Batch prioritas
            </div>
            <h3 className="mt-3 text-lg font-semibold text-text">Tanggal terdekat</h3>
            <p className="mt-1 text-sm text-muted">Urutan otomatis dari yang paling mendesak.</p>
          </div>
          <Link href="/expiry" className="btn-secondary">
            Lihat daftar
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {nearestBatches.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Belum ada data expired."
              description="Tambahkan pencatatan pertama untuk mulai memantau stok."
              action={
                <Link href="/expiry/new" className="btn-primary">
                  Tambah data
                </Link>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {nearestBatches.map((batch, index) => (
              <div
                key={batch.id}
                className={`grid gap-3 border-l-4 p-4 md:grid-cols-[auto_1fr_auto] md:items-center ${STATUS_ACCENT_CLASS[getExpiryStatus(batch.expiry_date)]}`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-soft text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-text">{batch.product?.name ?? "Produk tidak ditemukan"}</p>
                  <p className="mt-1 text-sm text-muted">
                    {formatDate(batch.expiry_date)} · {batch.quantity} pcs · {batch.product?.category?.name ?? "-"}
                  </p>
                </div>
                <StatusBadge status={getExpiryStatus(batch.expiry_date)} daysLeft={getDaysLeft(batch.expiry_date)} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {summary.map((item) => (
          <article key={item.label} className="panel p-4">
            <p className="text-sm font-semibold text-muted">{item.label}</p>
            <p className={`mt-3 text-3xl font-semibold ${item.tone}`}>{item.value}</p>
            <p className="mt-1 text-sm text-muted">{item.caption}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
