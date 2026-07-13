"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner, Toast } from "@/components/state-panels";
import { getSupabaseClient } from "@/lib/supabase";

type AuthMode = "signin" | "signup";

type AuthErrorLike = {
  code?: string;
  message?: string;
  name?: string;
  status?: number;
};

const MIN_PASSWORD_LENGTH = 6;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeAuthError(error: AuthErrorLike) {
  return `${error.code ?? ""} ${error.message ?? ""} ${error.name ?? ""}`.toLowerCase();
}

function getSignupErrorMessage(error: AuthErrorLike) {
  const normalizedError = normalizeAuthError(error);

  if (
    normalizedError.includes("already") ||
    normalizedError.includes("registered") ||
    normalizedError.includes("exists") ||
    normalizedError.includes("user_already_exists") ||
    normalizedError.includes("email_exists")
  ) {
    return "Email ini sudah terdaftar. Gunakan tab Masuk, atau pakai Lupa password jika kamu tidak ingat passwordnya.";
  }

  if (
    normalizedError.includes("weak") ||
    normalizedError.includes("password") ||
    normalizedError.includes("too short") ||
    normalizedError.includes("length")
  ) {
    return `Password belum memenuhi syarat. Gunakan minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  }

  if (
    normalizedError.includes("redirect") ||
    normalizedError.includes("url") ||
    normalizedError.includes("not_authorized")
  ) {
    return "Konfigurasi redirect Supabase belum cocok dengan URL aplikasi. Cek Site URL dan Redirect URLs di Supabase Auth.";
  }

  if (
    error.status === 429 ||
    normalizedError.includes("rate") ||
    normalizedError.includes("too many") ||
    normalizedError.includes("over_email_send_rate_limit")
  ) {
    return "Terlalu banyak percobaan daftar. Tunggu beberapa menit, lalu coba lagi.";
  }

  if (
    normalizedError.includes("signup") ||
    normalizedError.includes("signups") ||
    normalizedError.includes("disabled") ||
    normalizedError.includes("not allowed")
  ) {
    return "Pendaftaran akun sedang tidak aktif di Supabase Auth. Cek pengaturan Email signup di Supabase.";
  }

  return "Pendaftaran belum berhasil. Periksa email dan password lalu coba lagi.";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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
    setInfo("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password.trim()) {
      setError("Email dan password wajib diisi.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError("Format email belum valid.");
      return;
    }

    if (mode === "signup" && password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password minimal ${MIN_PASSWORD_LENGTH} karakter.`);
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Konfirmasi password belum sama.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();

      if (mode === "signup") {
        const { error: signupError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`
          }
        });

        if (signupError) {
          setError(getSignupErrorMessage(signupError));
          return;
        }

        await supabase.auth.signOut();
        setPassword("");
        setConfirmPassword("");
        setInfo("Pendaftaran berhasil. Cek email untuk verifikasi, lalu masuk kembali setelah akun terkonfirmasi.");
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
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

  async function handleResetPassword() {
    setError("");
    setInfo("");

    if (!email.trim()) {
      setError("Isi email terlebih dahulu untuk menerima link reset password.");
      return;
    }

    setIsResetting(true);
    try {
      const { error: resetError } = await getSupabaseClient().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`
      });

      if (resetError) {
        setError("Link reset password belum dapat dikirim. Periksa email lalu coba lagi.");
        return;
      }

      setInfo("Jika email terdaftar, link reset password akan dikirim oleh Supabase.");
    } catch {
      setError("Konfigurasi reset password belum tersedia. Periksa environment Supabase.");
    } finally {
      setIsResetting(false);
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setInfo("");
    setPassword("");
    setConfirmPassword("");
  }

  const isSignup = mode === "signup";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-white shadow-soft md:grid-cols-[1fr_0.9fr]">
        <div className="hidden bg-surface-soft p-8 md:flex md:flex-col md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Expiry Stock App</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-text">Pantau stok sebelum terlambat.</h1>
            <p className="mt-4 text-sm leading-6 text-muted">
              Masuk atau daftar akun baru untuk project Supabase yang digunakan aplikasi internal ini.
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
            <h1 className="mt-2 text-3xl font-bold text-text">{isSignup ? "Daftar akun" : "Masuk"}</h1>
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{isSignup ? "Daftar akun" : "Masuk"}</p>
            <h2 className="mt-2 text-3xl font-bold text-text">{isSignup ? "Buat akun baru" : "Selamat datang"}</h2>
          </div>

          <div className="mt-8 grid grid-cols-2 rounded-lg border border-border bg-surface-soft p-1" role="tablist" aria-label="Mode autentikasi">
            <button
              className={`min-h-10 rounded-md text-sm font-semibold transition-colors ${
                !isSignup ? "bg-white text-primary shadow-sm" : "text-muted hover:text-text"
              }`}
              type="button"
              role="tab"
              aria-selected={!isSignup}
              onClick={() => changeMode("signin")}
            >
              Masuk
            </button>
            <button
              className={`min-h-10 rounded-md text-sm font-semibold transition-colors ${
                isSignup ? "bg-white text-primary shadow-sm" : "text-muted hover:text-text"
              }`}
              type="button"
              role="tab"
              aria-selected={isSignup}
              onClick={() => changeMode("signup")}
            >
              Daftar
            </button>
          </div>

          <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
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
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </div>

            {isSignup ? (
              <div>
                <label className="label" htmlFor="confirm-password">
                  Konfirmasi password
                </label>
                <input
                  id="confirm-password"
                  className="field mt-2"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                />
              </div>
            ) : null}

            {error ? (
              <div className="rounded-lg border border-danger/30 bg-red-50 p-3 text-sm font-semibold text-danger">
                {error}
              </div>
            ) : null}

            {info ? (
              <div className="rounded-lg border border-primary/20 bg-surface-soft p-3 text-sm font-semibold text-primary">
                {info}
              </div>
            ) : null}

            <button className="btn-primary w-full" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner label={isSignup ? "Mendaftarkan" : "Memeriksa"} /> : isSignup ? "Daftar akun" : "Masuk ke dashboard"}
            </button>

            {!isSignup ? (
              <button
                className="w-full text-center text-sm font-semibold text-primary transition-colors hover:text-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                disabled={isLoading || isResetting}
                onClick={() => void handleResetPassword()}
              >
                {isResetting ? <Spinner label="Mengirim link reset" /> : "Lupa password?"}
              </button>
            ) : (
              <p className="text-sm leading-6 text-muted">
                Setelah daftar, verifikasi email dari Supabase. Profil staff akan aktif otomatis setelah akun terkonfirmasi.
              </p>
            )}
          </form>
        </div>
      </section>

      {toast ? <Toast message={toast} /> : null}
    </main>
  );
}
