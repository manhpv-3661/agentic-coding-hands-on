/**
 * Serializable Server Action input/result types for Kudos mutations
 * (F006/F007/F008 backend pivot, phase 03). Kept separate from
 * `kudos-db-types.ts` (raw Postgres rows) and `kudos-types.ts` (view-model
 * shapes) — these are the wire shapes that cross the client → server
 * boundary for `app/kudos/actions.ts`.
 */

/**
 * Input for `createKudosAction`. Derived from `ComposeFormState`
 * (`app/components/kudos/compose/compose-form-helpers.ts`) at the call site
 * in Phase 04 — deliberately primitives-only (no `File[]`) so it stays
 * serializable across the Server Action boundary. Image bytes go to
 * Supabase Storage first; the action receives only the resulting public URLs.
 */
export interface CreateKudosInput {
  title: string;
  content: string;
  hashtags: string[];
  imageUrls: string[];
  isAnonymous: boolean;
  anonymousName: string;
  receiverId: string;
}

/**
 * `createKudosAction` result.
 * - `{ ok: true, skipped: true }`: Supabase isn't configured (mock mode) —
 *   no DB write happened, the caller's optimistic client state stands alone.
 * - `{ ok: true, skipped: false, postId }`: row inserted.
 * - `{ ok: false, error }`: a stable, UI-agnostic error code (never a
 *   thrown exception) for the caller to map to a display message.
 */
export type CreateKudosResult =
  | { ok: true; skipped: true }
  | { ok: true; skipped: false; postId: string }
  | { ok: false; error: string };

/** `toggleLikeAction` result — mirrors `CreateKudosResult`'s shape. */
export type ToggleLikeResult =
  | { ok: true; skipped: true }
  | { ok: true; skipped: false; liked: boolean }
  | { ok: false; error: string };

/** `openSecretBoxAction` result — the successful branch returns the
 * concrete reward text that was persisted for the current user. */
export type OpenSecretBoxResult =
  | { ok: true; skipped: true }
  | { ok: true; skipped: false; giftText: string }
  | { ok: false; error: string };
