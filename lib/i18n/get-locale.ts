// server-only: reads request cookies via `next/headers`. Never import this
// from a Client Component (mirrors the convention in lib/supabase/server.ts).
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./locale";

const NEXT_LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * Reads the `NEXT_LOCALE` cookie and resolves it to a valid `Locale`.
 *
 * Next.js 16: `cookies()` is always async (see `lib/supabase/server.ts`),
 * so this must be awaited at every call site: `const locale = await
 * getLocale()`.
 *
 * Defaults to `"vi"` when the cookie is missing or holds anything other
 * than exactly `"en"` — `isLocale()` guards the dictionary lookup against
 * an unvalidated/tampered cookie value.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(NEXT_LOCALE_COOKIE)?.value;

  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}
