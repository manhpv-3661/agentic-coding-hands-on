/**
 * Single source of truth for Kudos compose-time bounds (review finding H1).
 * Imported by BOTH the client-side compose UI (`rich-text-editor.tsx`,
 * `hashtag-input.tsx`, `image-upload.tsx` — soft caps, immediate feedback)
 * AND `createKudosAction`'s server-side validation
 * (`lib/kudos/kudos-input-validation.ts` — hard enforcement before the
 * insert), so the two layers can never silently drift apart. Also mirrored
 * as `check` constraints in `supabase/schema.sql` for defense-in-depth at
 * the DB layer.
 */

/** Hard character cap on `content` (matches the Figma "0/1.000" counter). */
export const KUDOS_CONTENT_MAX_LENGTH = 1000;

/** Cap on the number of hashtag chips (F007 FR-11/12). */
export const KUDOS_HASHTAGS_MAX_COUNT = 5;

/** Cap on the number of attached images, per MoMorph ground truth. */
export const KUDOS_IMAGES_MAX_COUNT = 5;

/**
 * Per-file size/type bounds for Kudos image uploads (review finding,
 * Medium: the upload path previously had no server-side check at all — only
 * the client's `accept="image/*"`, trivially bypassable). Mirrored as the
 * `kudos-images` Storage bucket's `file_size_limit`/`allowed_mime_types` in
 * `supabase/schema.sql` (and its migration mirror) — THAT bucket config is
 * the real enforcement; this client-side copy is only for immediate UI
 * feedback before a wasted upload round-trip.
 */
export const KUDOS_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB
export const KUDOS_IMAGE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
