import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export { isSupabaseConfigured } from "./env";

/**
 * Supabase client for the server (Server Components / Route Handlers).
 *
 * Next.js 16: `cookies()` is always async — this factory must be awaited at
 * every call site: `const supabase = await createClient()`.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component (cookies are read-only there).
            // The proxy refreshes the session cookie on the request instead —
            // safe to ignore.
          }
        },
      },
    },
  );
}
