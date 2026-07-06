/** True when the Supabase env vars are configured. Shared by the browser and
 * server clients so the check lives in exactly one place. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
