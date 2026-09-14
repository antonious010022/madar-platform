import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project credentials."
  );
}

/**
 * Single shared Supabase client for the whole app (teacher + student).
 * Explicit auth options so OAuth redirect (PKCE / implicit) is detected
 * and the session is persisted across full page reloads.
 */
export const supabase = createClient(url || "", anonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
