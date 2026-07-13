import type { ExpiryStatus } from "@/types";

export const STATUS_OPTIONS: Array<{ value: ExpiryStatus | "all"; label: string }> = [
  { value: "all", label: "Semua status" },
  { value: "expired", label: "Expired" },
  { value: "critical", label: "Kritis" },
  { value: "warning", label: "Waspada" },
  { value: "safe", label: "Aman" }
];

export const STATUS_META: Record<
  ExpiryStatus,
  {
    label: string;
    description: string;
    className: string;
  }
> = {
  expired: {
    label: "Expired",
    description: "Tanggal sudah lewat",
    className: "border-danger/25 bg-danger-soft text-danger"
  },
  critical: {
    label: "Kritis",
    description: "0-2 hari",
    className: "border-danger/25 bg-danger-soft text-danger"
  },
  warning: {
    label: "Waspada",
    description: "3-13 hari",
    className: "border-warning/30 bg-warning-soft text-warning"
  },
  safe: {
    label: "Aman",
    description: "14+ hari",
    className: "border-success/25 bg-success-soft text-success"
  }
};

export const STATUS_ACCENT_CLASS: Record<ExpiryStatus, string> = {
  expired: "border-l-danger",
  critical: "border-l-danger",
  warning: "border-l-warning",
  safe: "border-l-success"
};

export function getDaysLeft(expiryDate: string, today = new Date()): number {
  const date = new Date(`${expiryDate}T00:00:00`);
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = date.getTime() - startToday.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(expiryDate: string, today = new Date()): ExpiryStatus {
  const daysLeft = getDaysLeft(expiryDate, today);

  if (daysLeft < 0) {
    return "expired";
  }

  if (daysLeft <= 2) {
    return "critical";
  }

  if (daysLeft <= 13) {
    return "warning";
  }

  return "safe";
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

export function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
