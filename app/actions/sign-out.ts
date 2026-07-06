"use server";

import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Real Supabase sign-out for the homepage account menu (FR-10).
 *
 * Clears the Supabase session cookie server-side (when Supabase env vars are
 * configured) then redirects to `/login`. Safe no-op on the Supabase call
 * when env is absent — matches the existing `app/todo/page.tsx` precedent so
 * local/dev environments without Supabase configured don't crash.
 *
 * Callable directly from a client component (e.g. the account menu) as a
 * Server Action: `<button onClick={() => signOutAction()}>` or via a
 * `<form action={signOutAction}>`.
 */
export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
