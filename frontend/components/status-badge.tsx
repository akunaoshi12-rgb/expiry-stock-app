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
      className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-[11px] font-semibold leading-none ${meta.className}`}
      title={meta.description}
    >
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
        <span>{meta.label}</span>
      </span>
      <span className="h-3 w-px bg-current opacity-25" aria-hidden="true" />
      <span className="font-medium opacity-80">{detail}</span>
    </span>
  );
}
