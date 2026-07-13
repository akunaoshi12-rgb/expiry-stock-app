"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ListChecks, LogOut, Plus } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expiry/new", label: "Tambah", icon: Plus },
  { href: "/expiry", label: "Daftar", icon: ListChecks }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await getSupabaseClient().auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-white/92 px-4 py-3 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/dashboard" className="min-w-0">
            <p className="text-xs font-semibold text-muted">Expiry Stock App</p>
            <h1 className="truncate text-lg font-semibold text-primary">Monitoring batch expired</h1>
          </Link>

          <nav className="hidden items-center gap-1 rounded-lg border border-border bg-surface-soft p-1 md:flex">
            {navigation.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${
                    active ? "bg-white text-primary shadow-sm" : "text-muted hover:text-text"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center sm:flex">
            <button className="btn-secondary min-h-10 px-3" type="button" onClick={() => void handleLogout()}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-32 pt-5 md:px-8 md:pb-12 md:pt-8">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-soft backdrop-blur md:hidden">
        <div className="grid grid-cols-4 gap-1">
          {navigation.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-semibold transition-colors ${
                  active ? "bg-surface-soft text-primary" : "text-muted hover:text-text"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
          <button
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-semibold text-muted transition-colors hover:text-text"
            type="button"
            onClick={() => void handleLogout()}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
}
