import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/login/page";
import { getSupabaseClient } from "@/lib/supabase";

const pushMock = vi.fn();
const signInWithPasswordMock = vi.fn();
const signUpMock = vi.fn();
const signOutMock = vi.fn();
const resetPasswordForEmailMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseClient: vi.fn()
}));

const getSupabaseClientMock = vi.mocked(getSupabaseClient);

async function fillSignupForm(password = "password-baru") {
  const user = userEvent.setup();
  render(<LoginPage />);

  await user.click(screen.getByRole("tab", { name: /daftar/i }));
  await user.type(screen.getByLabelText(/email/i), "baru@example.com");
  await user.type(screen.getByLabelText(/^password$/i), password);
  await user.type(screen.getByLabelText(/konfirmasi password/i), password);

  return user;
}

beforeEach(() => {
  getSupabaseClientMock.mockReturnValue({
    auth: {
      resetPasswordForEmail: resetPasswordForEmailMock,
      signInWithPassword: signInWithPasswordMock,
      signOut: signOutMock,
      signUp: signUpMock
    }
  } as never);
  signInWithPasswordMock.mockResolvedValue({ error: null });
  signOutMock.mockResolvedValue({ error: null });
  signUpMock.mockResolvedValue({ error: null });
  resetPasswordForEmailMock.mockResolvedValue({ error: null });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("LoginPage", () => {
  it("login sukses memakai Supabase Auth", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "staff@example.com");
    await user.type(screen.getByLabelText(/password/i), "password");
    await user.click(screen.getByRole("button", { name: /masuk ke dashboard/i }));

    await waitFor(() =>
      expect(signInWithPasswordMock).toHaveBeenCalledWith({
        email: "staff@example.com",
        password: "password"
      })
    );
    expect(await screen.findByText("Login berhasil. Membuka dashboard.")).toBeInTheDocument();
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
  });

  it("menampilkan error login dari Supabase tanpa detail internal", async () => {
    const user = userEvent.setup();
    signInWithPasswordMock.mockResolvedValue({ error: new Error("internal") });
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "staff@example.com");
    await user.type(screen.getByLabelText(/password/i), "salah");
    await user.click(screen.getByRole("button", { name: /masuk ke dashboard/i }));

    expect(await screen.findByText("Login belum berhasil. Periksa email atau password lalu coba lagi.")).toBeInTheDocument();
    expect(screen.queryByText("internal")).not.toBeInTheDocument();
  });

  it("daftar akun memakai Supabase Auth dan menampilkan instruksi verifikasi email", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("tab", { name: /daftar/i }));
    await user.type(screen.getByLabelText(/email/i), "baru@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password-baru");
    await user.type(screen.getByLabelText(/konfirmasi password/i), "password-baru");
    await user.click(screen.getByRole("button", { name: /daftar akun/i }));

    await waitFor(() =>
      expect(signUpMock).toHaveBeenCalledWith({
        email: "baru@example.com",
        password: "password-baru",
        options: {
          emailRedirectTo: expect.stringContaining("/login")
        }
      })
    );
    expect(signOutMock).toHaveBeenCalled();
    expect(await screen.findByText("Jika pendaftaran dapat diproses, cek email untuk verifikasi. Jika email ini sudah punya akun, gunakan tab Masuk atau Lupa password.")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("menolak daftar akun saat konfirmasi password berbeda", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("tab", { name: /daftar/i }));
    await user.type(screen.getByLabelText(/email/i), "baru@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password-baru");
    await user.type(screen.getByLabelText(/konfirmasi password/i), "password-lain");
    await user.click(screen.getByRole("button", { name: /daftar akun/i }));

    expect(await screen.findByText("Konfirmasi password belum sama.")).toBeInTheDocument();
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("menolak daftar akun saat email tidak valid sebelum memanggil Supabase", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("tab", { name: /daftar/i }));
    await user.type(screen.getByLabelText(/email/i), "email-salah");
    await user.type(screen.getByLabelText(/^password$/i), "password-baru");
    await user.type(screen.getByLabelText(/konfirmasi password/i), "password-baru");
    await user.click(screen.getByRole("button", { name: /daftar akun/i }));

    expect(await screen.findByText("Format email belum valid.")).toBeInTheDocument();
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("menolak daftar akun saat password terlalu pendek sebelum memanggil Supabase", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("tab", { name: /daftar/i }));
    await user.type(screen.getByLabelText(/email/i), "baru@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "abc");
    await user.type(screen.getByLabelText(/konfirmasi password/i), "abc");
    await user.click(screen.getByRole("button", { name: /daftar akun/i }));

    expect(await screen.findByText("Password minimal 6 karakter.")).toBeInTheDocument();
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("menampilkan pesan signup netral saat email sudah terdaftar", async () => {
    signUpMock.mockResolvedValue({
      error: { code: "user_already_exists", message: "User already registered" }
    });
    const user = await fillSignupForm();

    await user.click(screen.getByRole("button", { name: /daftar akun/i }));

    expect(await screen.findByText("Jika pendaftaran dapat diproses, cek email untuk verifikasi. Jika email ini sudah punya akun, gunakan tab Masuk atau Lupa password.")).toBeInTheDocument();
    expect(screen.queryByText(/email ini sudah terdaftar/i)).not.toBeInTheDocument();
    expect(signOutMock).toHaveBeenCalled();
  });

  it("menampilkan pesan signup saat password ditolak Supabase", async () => {
    signUpMock.mockResolvedValue({
      error: { message: "Password should be at least 8 characters" }
    });
    const user = await fillSignupForm();

    await user.click(screen.getByRole("button", { name: /daftar akun/i }));

    expect(await screen.findByText("Password belum memenuhi syarat. Gunakan minimal 6 karakter.")).toBeInTheDocument();
  });

  it("menampilkan pesan signup saat redirect Supabase belum cocok", async () => {
    signUpMock.mockResolvedValue({
      error: { message: "Redirect URL is not allowed" }
    });
    const user = await fillSignupForm();

    await user.click(screen.getByRole("button", { name: /daftar akun/i }));

    expect(await screen.findByText("Konfigurasi redirect Supabase belum cocok dengan URL aplikasi. Cek Site URL dan Redirect URLs di Supabase Auth.")).toBeInTheDocument();
  });

  it("menampilkan pesan signup saat rate limit Supabase aktif", async () => {
    signUpMock.mockResolvedValue({
      error: { message: "over_email_send_rate_limit", status: 429 }
    });
    const user = await fillSignupForm();

    await user.click(screen.getByRole("button", { name: /daftar akun/i }));

    expect(await screen.findByText("Terlalu banyak percobaan daftar. Tunggu beberapa menit, lalu coba lagi.")).toBeInTheDocument();
  });

  it("menampilkan pesan signup saat signup Supabase dimatikan", async () => {
    signUpMock.mockResolvedValue({
      error: { message: "Signups not allowed for this instance" }
    });
    const user = await fillSignupForm();

    await user.click(screen.getByRole("button", { name: /daftar akun/i }));

    expect(await screen.findByText("Pendaftaran akun sedang tidak aktif di Supabase Auth. Cek pengaturan Email signup di Supabase.")).toBeInTheDocument();
  });

  it("tetap menyembunyikan detail internal untuk error signup yang tidak dikenali", async () => {
    signUpMock.mockResolvedValue({
      error: { message: "database internal exploded" }
    });
    const user = await fillSignupForm();

    await user.click(screen.getByRole("button", { name: /daftar akun/i }));

    expect(await screen.findByText("Pendaftaran belum berhasil. Periksa email dan password lalu coba lagi.")).toBeInTheDocument();
    expect(screen.queryByText("database internal exploded")).not.toBeInTheDocument();
  });

  it("mengirim link reset password untuk mode masuk", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "staff@example.com");
    await user.click(screen.getByRole("button", { name: /lupa password/i }));

    await waitFor(() =>
      expect(resetPasswordForEmailMock).toHaveBeenCalledWith("staff@example.com", {
        redirectTo: expect.stringContaining("/login")
      })
    );
    expect(await screen.findByText("Jika email terdaftar, link reset password akan dikirim oleh Supabase.")).toBeInTheDocument();
  });
});
