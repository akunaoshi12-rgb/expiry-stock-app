import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

function readSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Konfigurasi Supabase belum tersedia.");
  }

  return { publishableKey, url };
}

export function getSupabaseClient(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  const { publishableKey, url } = readSupabaseConfig();
  browserClient = createClient(url, publishableKey);
  return browserClient;
}

export async function getAccessToken(): Promise<string> {
  const { data, error } = await getSupabaseClient().auth.getSession();

  if (error || !data.session?.access_token) {
    throw new Error("Sesi tidak valid atau sudah berakhir. Silakan login ulang.");
  }

  return data.session.access_token;
}

export function getUserRole(user: User | null): "staff" | "admin" {
  const metadataRole = user?.app_metadata?.role ?? user?.user_metadata?.role;
  return metadataRole === "admin" ? "admin" : "staff";
}
