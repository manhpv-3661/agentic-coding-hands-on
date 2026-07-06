/**
 * Accepts only same-origin relative paths; rejects absolute/external URLs
 * (open-redirect guard). Mirrors the inline check in `app/auth/callback/route.ts`.
 */
export function sanitizeInternalPath(raw: string | null | undefined): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
}
