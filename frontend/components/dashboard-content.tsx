"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getDashboardSummary } from "@/lib/api";
import { getBatchesWithProduct } from "@/lib/dummy-data";
import { formatDate } from "@/lib/status";
import type { DashboardSummary } from "@/types";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/state-panels";
import { StatusBadge } from "@/components/status-badge";

export function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const batches = useMemo(() => getBatchesWithProduct(), []);

  const applyDashboardRequest = useCallback(async () => {
    try {
      const data = await getDashboardSummary();
      setDashboardSummary(data);
    } catch (error) {
      setDashboardSummary(null);
      setErrorMessage(error instanceof Error ? error.message : "Ringkasan dashboard belum dapat ditampilkan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInitialDashboardSummary() {
      try {
        const data = await getDashboardSummary();

        if (!isActive) {
          return;
        }

        setDashboardSummary(data);
        setErrorMessage("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setDashboardSummary(null);
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

        {batches.length === 0 ? (
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
            {batches.slice(0, 5).map((batch) => (
              <div key={batch.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-text">{batch.product.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {batch.product.category?.name ?? "-"} - {formatDate(batch.expiryDate)} - {batch.stock} pcs
                  </p>
                </div>
                <StatusBadge status={batch.status} daysLeft={batch.daysLeft} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
