"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getDashboardSummary, getProductBatches } from "@/lib/api";
import { formatDate, getDaysLeft, getExpiryStatus } from "@/lib/status";
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
        label: "Batch expired",
        value: dashboardSummary.expired_batches,
        caption: "Tanggal sudah lewat"
      },
      {
        label: "Dalam 7 hari",
        value: dashboardSummary.critical_batches,
        caption: "Harus segera dicek"
      },
      {
        label: "Dalam 14 hari",
        value: dashboardSummary.urgent_batches,
        caption: "Prioritas tinggi"
      },
      {
        label: "Stok berisiko",
        value: dashboardSummary.at_risk_stock,
        caption: "Total sisa stok"
      }
    ];
  }, [dashboardSummary]);

  const nearestBatches = useMemo(
    () => [...batches].sort((a, b) => getDaysLeft(a.expiry_date) - getDaysLeft(b.expiry_date)).slice(0, 5),
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
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Dashboard</p>
          <h2 className="mt-2 text-2xl font-bold text-text md:text-3xl">Prioritas pengecekan stok</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Pantau batch yang sudah expired atau mendekati tanggal expired berdasarkan data API.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/expiry/new" className="btn-primary">
            + Tambah data
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <article key={item.label} className="card p-5">
            <p className="text-sm font-semibold text-muted">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-text">{item.value}</p>
            <p className="mt-1 text-sm text-muted">{item.caption}</p>
          </article>
        ))}
      </section>

      <section className="card overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b border-border p-5 md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-semibold text-text">Tanggal terdekat</h3>
            <p className="mt-1 text-sm text-muted">Urutan otomatis dari yang paling mendesak.</p>
          </div>
          <Link href="/expiry" className="btn-secondary">
            Lihat daftar
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
            {nearestBatches.map((batch) => (
              <div key={batch.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-text">{batch.product?.name ?? "Produk tidak ditemukan"}</p>
                  <p className="mt-1 text-sm text-muted">
                    {batch.product?.category?.name ?? "-"} - {formatDate(batch.expiry_date)} - {batch.quantity} pcs
                  </p>
                </div>
                <StatusBadge status={getExpiryStatus(batch.expiry_date)} daysLeft={getDaysLeft(batch.expiry_date)} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
