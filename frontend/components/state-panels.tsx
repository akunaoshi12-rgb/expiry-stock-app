export function Spinner({ label = "Memuat" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-4" aria-label="Data sedang dimuat">
      {[0, 1, 2].map((item) => (
        <div key={item} className="card p-4">
          <div className="h-4 w-2/5 animate-pulse rounded bg-surface-muted" />
          <div className="mt-4 h-3 w-full animate-pulse rounded bg-surface-soft" />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-surface-soft" />
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-start gap-3 p-6">
      <div className="rounded-lg bg-surface-soft px-3 py-2 text-sm font-semibold text-primary">
        Belum ada data
      </div>
      <div>
        <h3 className="text-lg font-semibold text-text">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Data belum dapat ditampilkan",
  description,
  onRetry
}: ErrorStateProps) {
  return (
    <div className="card border-danger/30 bg-red-50 p-5 text-danger">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-6">{description}</p>
      {onRetry ? (
        <button className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-danger" onClick={onRetry}>
          Coba lagi
        </button>
      ) : null}
    </div>
  );
}

interface ToastProps {
  message: string;
  type?: "success" | "error";
}

export function Toast({ message, type = "success" }: ToastProps) {
  const className =
    type === "success"
      ? "border-success/30 bg-green-50 text-success"
      : "border-danger/30 bg-red-50 text-danger";

  return (
    <div className={`fixed bottom-24 left-4 right-4 z-50 rounded-lg border p-4 text-sm font-semibold shadow-soft md:left-auto md:right-8 md:w-96 ${className}`}>
      {message}
    </div>
  );
}
