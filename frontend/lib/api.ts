import type {
  ApiErrorResponse,
  DashboardSummary,
  DashboardSummaryResponse,
  Product,
  ProductBatch,
  ProductBatchCreateRequest,
  ProductBatchCreateResponse,
  ProductBatchDeleteResponse,
  ProductBatchDetailResponse,
  ProductBatchListResponse,
  ProductBatchUpdateRequest,
  ProductBatchUpdateResponse,
  ProductBatchWithProduct,
  ProductSearchResponse
} from "@/types";
import { getAccessToken } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;

interface ApiDebugInfo {
  body?: unknown;
  contentType?: string | null;
  error?: unknown;
  method: string;
  status?: number;
  url: string;
}

function getApiUrl(path: string): string {
  if (!API_URL) {
    throw new Error("Konfigurasi API belum tersedia. Periksa NEXT_PUBLIC_API_BASE_URL.");
  }

  return `${API_URL.replace(/\/$/, "")}${path}`;
}

function logApiError(info: ApiDebugInfo) {
  const safeInfo = {
    url: info.url,
    method: info.method,
    status: info.status,
    contentType: info.contentType,
    responseBody: info.body,
    networkError: info.error instanceof Error ? info.error.message : info.error
  };

  console.error("[ExpiryStockApiError]", safeInfo);
}

async function authHeaders(extraHeaders?: HeadersInit): Promise<HeadersInit> {
  const token = await getAccessToken();
  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`
  };
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

function isSessionError(error: unknown): error is Error {
  return error instanceof Error && error.message.startsWith("Sesi tidak valid");
}

async function readJsonResponse<T>(
  response: Response,
  fallbackMessage: string,
  request: { method: string; url: string }
): Promise<T> {
  const contentType = response.headers?.get("content-type") ?? null;
  let payload: unknown = null;

  if (contentType?.includes("application/json") || !contentType) {
    payload = await response.json();
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    logApiError({
      body: payload,
      contentType,
      method: request.method,
      status: response.status,
      url: request.url
    });
    throw new Error(readApiError(payload as ApiErrorResponse | { error?: unknown }, fallbackMessage));
  }

  return payload as T;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  let response: Response;
  const url = getApiUrl("/api/dashboard/summary");

  try {
    response = await fetch(url, {
      headers: await authHeaders()
    });
  } catch (error) {
    if (isSessionError(error)) {
      throw error;
    }
    logApiError({ error, method: "GET", url });
    throw new Error("Dashboard belum dapat dimuat. Pastikan backend FastAPI sedang berjalan.");
  }

  const payload = await readJsonResponse<DashboardSummaryResponse>(
    response,
    "Dashboard belum dapat dimuat. Coba beberapa saat lagi.",
    { method: "GET", url }
  );

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
  const url = getApiUrl(`/api/products/search?${params.toString()}`);

  try {
    response = await fetch(url, {
      headers: await authHeaders(),
      signal
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    if (isSessionError(error)) {
      throw error;
    }

    logApiError({ error, method: "GET", url });
    throw new Error("Gagal mencari produk. Coba lagi.");
  }

  const payload = await readJsonResponse<ProductSearchResponse | ApiErrorResponse>(
    response,
    "Gagal mencari produk. Coba lagi.",
    { method: "GET", url }
  );

  if (payload.error) {
    throw new Error(readApiError(payload, "Gagal mencari produk. Coba lagi."));
  }

  return payload.data ?? [];
}

export async function createProductBatch(request: ProductBatchCreateRequest): Promise<ProductBatch> {
  let response: Response;
  const url = getApiUrl("/api/product-batches");

  try {
    response = await fetch(url, {
      method: "POST",
      headers: await authHeaders({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(request)
    });
  } catch (error) {
    if (isSessionError(error)) {
      throw error;
    }
    logApiError({ error, method: "POST", url });
    throw new Error("Batch belum dapat disimpan. Periksa koneksi lalu coba lagi.");
  }

  const payload = await readJsonResponse<ProductBatchCreateResponse | ApiErrorResponse>(
    response,
    "Batch belum dapat disimpan. Coba lagi.",
    { method: "POST", url }
  );

  if (payload.error || !payload.data) {
    throw new Error(readApiError(payload, "Batch belum dapat disimpan. Coba lagi."));
  }

  return payload.data;
}

export async function getProductBatches(): Promise<ProductBatchWithProduct[]> {
  let response: Response;
  const url = getApiUrl("/api/product-batches");

  try {
    response = await fetch(url, {
      headers: await authHeaders()
    });
  } catch (error) {
    if (isSessionError(error)) {
      throw error;
    }
    logApiError({ error, method: "GET", url });
    throw new Error("Daftar batch belum dapat dimuat. Periksa koneksi lalu coba lagi.");
  }

  const payload = await readJsonResponse<ProductBatchListResponse | ApiErrorResponse>(
    response,
    "Daftar batch belum dapat dimuat. Coba lagi.",
    { method: "GET", url }
  );

  if (payload.error) {
    throw new Error(readApiError(payload, "Daftar batch belum dapat dimuat. Coba lagi."));
  }

  return payload.data ?? [];
}

export async function getProductBatch(id: string): Promise<ProductBatchWithProduct> {
  let response: Response;
  const url = getApiUrl(`/api/product-batches/${id}`);

  try {
    response = await fetch(url, {
      headers: await authHeaders()
    });
  } catch (error) {
    if (isSessionError(error)) {
      throw error;
    }
    logApiError({ error, method: "GET", url });
    throw new Error("Detail batch belum dapat dimuat. Periksa koneksi lalu coba lagi.");
  }

  const payload = await readJsonResponse<ProductBatchDetailResponse | ApiErrorResponse>(
    response,
    "Detail batch belum dapat dimuat. Coba lagi.",
    { method: "GET", url }
  );

  if (payload.error || !payload.data) {
    throw new Error(readApiError(payload, "Detail batch belum dapat dimuat. Coba lagi."));
  }

  return payload.data;
}

export async function updateProductBatch(
  id: string,
  request: ProductBatchUpdateRequest
): Promise<ProductBatchWithProduct> {
  let response: Response;
  const url = getApiUrl(`/api/product-batches/${id}`);

  try {
    response = await fetch(url, {
      method: "PATCH",
      headers: await authHeaders({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(request)
    });
  } catch (error) {
    if (isSessionError(error)) {
      throw error;
    }
    logApiError({ error, method: "PATCH", url });
    throw new Error("Batch belum dapat diperbarui. Periksa koneksi lalu coba lagi.");
  }

  const payload = await readJsonResponse<ProductBatchUpdateResponse | ApiErrorResponse>(
    response,
    "Batch belum dapat diperbarui. Coba lagi.",
    { method: "PATCH", url }
  );

  if (payload.error || !payload.data) {
    throw new Error(readApiError(payload, "Batch belum dapat diperbarui. Coba lagi."));
  }

  return payload.data;
}

export async function deleteProductBatch(id: string): Promise<ProductBatchWithProduct> {
  let response: Response;
  const url = getApiUrl(`/api/product-batches/${id}`);

  try {
    response = await fetch(url, {
      method: "DELETE",
      headers: await authHeaders()
    });
  } catch (error) {
    if (isSessionError(error)) {
      throw error;
    }
    logApiError({ error, method: "DELETE", url });
    throw new Error("Batch belum dapat dihapus. Periksa koneksi lalu coba lagi.");
  }

  const payload = await readJsonResponse<ProductBatchDeleteResponse | ApiErrorResponse>(
    response,
    "Batch belum dapat dihapus. Coba lagi.",
    { method: "DELETE", url }
  );

  if (payload.error || !payload.data) {
    throw new Error(readApiError(payload, "Batch belum dapat dihapus. Coba lagi."));
  }

  return payload.data;
}
