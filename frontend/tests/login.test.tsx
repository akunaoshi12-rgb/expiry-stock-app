import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/login/page";
import { getSupabaseClient } from "@/lib/supabase";

const pushMock = vi.fn();
const signInWithPasswordMock = vi.fn();

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
      signInWithPassword: signInWithPasswordMock
    }
  } as never);
  signInWithPasswordMock.mockResolvedValue({ error: null });
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
});
