import type { DashboardSummary, DashboardSummaryResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl(path: string): string {
  if (!API_URL) {
    throw new Error("Konfigurasi API belum tersedia. Periksa NEXT_PUBLIC_API_URL.");
  }

  return `${API_URL}${path}`;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  let response: Response;

  try {
    response = await fetch(getApiUrl("/api/dashboard/summary"));
  } catch {
    throw new Error("Dashboard belum dapat dimuat. Pastikan backend FastAPI sedang berjalan.");
  }

  if (!response.ok) {
    throw new Error("Dashboard belum dapat dimuat. Coba beberapa saat lagi.");
  }

  const payload = (await response.json()) as DashboardSummaryResponse;

  if (payload.error) {
    throw new Error(payload.error);
  }

  if (!payload.data) {
    throw new Error("Data dashboard dari server kosong.");
  }

  return payload.data;
}
