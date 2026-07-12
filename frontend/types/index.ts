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

export interface ProductBatchCreateRequest {
  product_id: string;
  batch_number: string | null;
  quantity: number;
  received_date: string | null;
  expiry_date: string;
  storage_location: string | null;
  notes: string | null;
}

export interface ProductBatchUpdateRequest {
  batch_number: string | null;
  quantity: number;
  received_date: string | null;
  expiry_date: string;
  storage_location: string | null;
  notes: string | null;
}

export interface ProductBatch {
  id: string;
  product_id: string;
  batch_number: string | null;
  quantity: number;
  received_date: string | null;
  expiry_date: string;
  storage_location: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductBatchWithProduct extends ProductBatch {
  product: Product | null;
}

export interface ProductBatchCreateResponse {
  data: ProductBatch | null;
  error: ApiError | null;
}

export interface ProductBatchListResponse {
  data: ProductBatchWithProduct[] | null;
  error: ApiError | null;
}

export interface ProductBatchDetailResponse {
  data: ProductBatchWithProduct | null;
  error: ApiError | null;
}

export interface ProductBatchUpdateResponse {
  data: ProductBatchWithProduct | null;
  error: ApiError | null;
}

export interface ProductBatchDeleteResponse {
  data: ProductBatchWithProduct | null;
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
