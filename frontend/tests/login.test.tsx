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
    expect(await screen.findByText("Pendaftaran berhasil. Cek email untuk verifikasi, lalu masuk kembali setelah akun terkonfirmasi.")).toBeInTheDocument();
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
