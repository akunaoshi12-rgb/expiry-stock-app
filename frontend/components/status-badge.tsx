import type { ExpiryStatus } from "@/types";
import { STATUS_META } from "@/lib/status";

interface StatusBadgeProps {
  status: ExpiryStatus;
  daysLeft?: number;
}

export function StatusBadge({ status, daysLeft }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  const detail =
    typeof daysLeft === "number"
      ? daysLeft < 0
        ? `${Math.abs(daysLeft)} hari lewat`
        : `${daysLeft} hari lagi`
      : meta.description;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}
      title={meta.description}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      <span>{meta.label}</span>
      <span className="font-medium opacity-80">{detail}</span>
    </span>
  );
}
