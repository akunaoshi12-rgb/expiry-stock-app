export type ExpiryStatus = "expired" | "critical" | "urgent" | "warning" | "safe";

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  active: boolean;
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
