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
