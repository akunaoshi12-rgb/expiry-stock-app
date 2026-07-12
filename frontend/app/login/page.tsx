"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner, Toast } from "@/components/state-panels";
import { getSupabaseClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(""), 1600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const { error: loginError } = await getSupabaseClient().auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (loginError) {
        setError("Login belum berhasil. Periksa email atau password lalu coba lagi.");
        return;
      }

      setIsLoading(false);
      setToast("Login berhasil. Membuka dashboard.");
      router.push("/dashboard");
    } catch {
      setError("Konfigurasi login belum tersedia. Periksa environment Supabase.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-white shadow-soft md:grid-cols-[1fr_0.9fr]">
        <div className="hidden bg-surface-soft p-8 md:flex md:flex-col md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Expiry Stock App</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-text">Pantau stok sebelum terlambat.</h1>
            <p className="mt-4 text-sm leading-6 text-muted">
              Masuk dengan akun Supabase yang sudah dibuat untuk aplikasi internal ini.
            </p>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-muted">
            <div className="rounded-lg border border-border bg-white p-4">
              Cari produk berdasarkan nama atau barcode.
            </div>
            <div className="rounded-lg border border-border bg-white p-4">
              Catat tanggal expired dan sisa stok per batch.
            </div>
            <div className="rounded-lg border border-border bg-white p-4">
              Lihat prioritas penanganan dari dashboard.
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-8 md:hidden">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Expiry Stock App</p>
            <h1 className="mt-2 text-3xl font-bold text-text">Masuk</h1>
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Masuk</p>
            <h2 className="mt-2 text-3xl font-bold text-text">Selamat datang</h2>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="field mt-2"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="staff@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="field mt-2"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Masukkan password"
                autoComplete="current-password"
              />
            </div>

            {error ? (
              <div className="rounded-lg border border-danger/30 bg-red-50 p-3 text-sm font-semibold text-danger">
                {error}
              </div>
            ) : null}

            <button className="btn-primary w-full" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner label="Memeriksa" /> : "Masuk ke dashboard"}
            </button>
          </form>
        </div>
      </section>

      {toast ? <Toast message={toast} /> : null}
    </main>
  );
}
