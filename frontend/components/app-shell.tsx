"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: "D" },
  { href: "/expiry/new", label: "Tambah", icon: "+" },
  { href: "/expiry", label: "Daftar", icon: "L" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-surface px-5 py-6 lg:block">
        <Link href="/dashboard" className="block">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Expiry Stock</p>
          <h1 className="mt-1 text-2xl font-bold text-primary">Monitoring Stok</h1>
        </Link>

        <nav className="mt-8 space-y-2">
          {navigation.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                  active ? "bg-surface-soft text-primary" : "text-muted hover:bg-surface-soft hover:text-text"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs shadow-sm">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Aplikasi internal</p>
              <p className="font-semibold text-text">Expiry Stock App</p>
            </div>
            <Link href="/expiry/new" className="btn-primary hidden sm:inline-flex">
              + Tambah data
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:px-8 md:pt-8">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface px-2 py-2 shadow-soft lg:hidden">
        <div className="grid grid-cols-3 gap-2">
          {navigation.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                  active ? "bg-surface-soft text-primary" : "text-muted"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
