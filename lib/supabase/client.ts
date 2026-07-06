import { createBrowserClient } from "@supabase/ssr";

export { isSupabaseConfigured } from "./env";

/**
 * Supabase client for the browser (Client Components).
 *
 * Reads the public project URL + anon key. In this mock/training repo the env
 * vars may be absent until the user provisions a Supabase project — the client
 * is created lazily and only throws when it actually makes a network call, so
 * `next build` and unit tests that never touch auth stay green.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
