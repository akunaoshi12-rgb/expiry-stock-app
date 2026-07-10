export type ExpiryStatus = "expired" | "critical" | "urgent" | "warning" | "safe";

export interface ApiError {
  code: string;
  message: string;
  details: Record<string, unknown>;
}

export interface ApiErrorResponse {
  data: null;
  error: ApiError;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  barcode: string | null;
  internal_code: string | null;
  name: string;
  category: ProductCategory | null;
  is_active: boolean;
}

export interface ProductSearchResponse {
  data: Product[] | null;
  error: ApiError | null;
}

export interface ExpiryBatch {
  id: string;
  productId: string;
  expiryDate: string;
  stock: number;
  batchNumber?: string;
  location?: string;
  notes?: string;
  updatedAt: string;
}

export interface ExpiryBatchWithProduct extends ExpiryBatch {
  product: Product;
  status: ExpiryStatus;
  daysLeft: number;
}

export interface DashboardSummary {
  expired_batches: number;
  critical_batches: number;
  urgent_batches: number;
  warning_batches: number;
  at_risk_stock: number;
}

export interface DashboardSummaryResponse {
  data: DashboardSummary | null;
  error: string | null;
}
