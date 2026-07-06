import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Server-side auth guard for protected pages — defense-in-depth alongside
 * `proxy.ts`. Call from a Server Component that must not render without a
 * signed-in user.
 *
 * - Supabase not configured (mock/training repo): returns `null` so the page
 *   still renders without crashing.
 * - Configured but no session: redirects to `/login` (never returns).
 * - Configured with a session: returns the Supabase user.
 */
export async function requireUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Like `requireUser`, but never redirects — for pages/components that render
 * regardless of auth state and only need to know who (if anyone) is signed
 * in (e.g. to toggle header UI).
 */
export async function getOptionalUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
