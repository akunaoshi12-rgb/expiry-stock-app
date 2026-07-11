import type {
  ApiErrorResponse,
  DashboardSummary,
  DashboardSummaryResponse,
  Product,
  ProductBatch,
  ProductBatchCreateRequest,
  ProductBatchCreateResponse,
  ProductBatchListResponse,
  ProductBatchWithProduct,
  ProductSearchResponse
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getApiUrl(path: string): string {
  if (!API_URL) {
    throw new Error("Konfigurasi API belum tersedia. Periksa NEXT_PUBLIC_API_BASE_URL.");
  }

  return `${API_URL.replace(/\/$/, "")}${path}`;
}

function readApiError(payload: ApiErrorResponse | { error?: unknown }, fallback: string): string {
  if (
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error &&
    typeof payload.error.message === "string" &&
    payload.error.message.trim()
  ) {
    return payload.error.message;
  }

  return fallback;
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

export async function searchProducts(query: string, signal?: AbortSignal): Promise<Product[]> {
  const params = new URLSearchParams({
    q: query,
    limit: "10"
  });

  let response: Response;

  try {
    response = await fetch(getApiUrl(`/api/products/search?${params.toString()}`), { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new Error("Gagal mencari produk. Coba lagi.");
  }

  const payload = (await response.json()) as ProductSearchResponse | ApiErrorResponse;

  if (!response.ok || payload.error) {
    throw new Error(readApiError(payload, "Gagal mencari produk. Coba lagi."));
  }

  return payload.data ?? [];
}

export async function createProductBatch(request: ProductBatchCreateRequest): Promise<ProductBatch> {
  let response: Response;

  try {
    response = await fetch(getApiUrl("/api/product-batches"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });
  } catch {
    throw new Error("Batch belum dapat disimpan. Periksa koneksi lalu coba lagi.");
  }

  const payload = (await response.json()) as ProductBatchCreateResponse | ApiErrorResponse;

  if (!response.ok || payload.error || !payload.data) {
    throw new Error(readApiError(payload, "Batch belum dapat disimpan. Coba lagi."));
  }

  return payload.data;
}

export async function getProductBatches(): Promise<ProductBatchWithProduct[]> {
  let response: Response;

  try {
    response = await fetch(getApiUrl("/api/product-batches"));
  } catch {
    throw new Error("Daftar batch belum dapat dimuat. Periksa koneksi lalu coba lagi.");
  }

  const payload = (await response.json()) as ProductBatchListResponse | ApiErrorResponse;

  if (!response.ok || payload.error) {
    throw new Error(readApiError(payload, "Daftar batch belum dapat dimuat. Coba lagi."));
  }

  return payload.data ?? [];
}
