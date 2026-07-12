import { afterEach, describe, expect, it, vi } from "vitest";
import { getAccessToken } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  getAccessToken: vi.fn()
}));

const getAccessTokenMock = vi.mocked(getAccessToken);

afterEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("api client", () => {
  it("mengirim bearer token pada request terlindungi", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:8000");
    getAccessTokenMock.mockResolvedValue("session-token");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], error: null })
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getProductBatches } = await import("@/lib/api");
    await getProductBatches();

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/api/product-batches", {
      headers: {
        Authorization: "Bearer session-token"
      }
    });
  });

  it("mengembalikan error saat session tidak tersedia", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:8000");
    getAccessTokenMock.mockRejectedValue(new Error("Sesi tidak valid atau sudah berakhir. Silakan login ulang."));

    const { getProductBatches } = await import("@/lib/api");

    await expect(getProductBatches()).rejects.toThrow("Sesi tidak valid");
  });
});
