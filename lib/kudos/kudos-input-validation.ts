import {
  KUDOS_CONTENT_MAX_LENGTH,
  KUDOS_HASHTAGS_MAX_COUNT,
  KUDOS_IMAGES_MAX_COUNT,
} from "./kudos-compose-limits";
import type { CreateKudosInput } from "./kudos-action-types";

/**
 * Stable, UI-agnostic error codes for `validateCreateKudosInput` — the
 * caller (`createKudosAction`) returns these verbatim as `{ ok: false,
 * error }`, same convention as the action's own DB-failure error codes.
 */
export type CreateKudosValidationError =
  | "invalid_title"
  | "invalid_content"
  | "content_too_long"
  | "invalid_hashtags"
  | "too_many_hashtags"
  | "invalid_image_urls"
  | "too_many_images"
  | "invalid_recipient"
  | "invalid_anonymous_flag"
  | "invalid_anonymous_name";

/**
 * Server-side bound/type validation for `createKudosAction` (review finding
 * H1). Server Actions are directly-invocable public POST endpoints, so a
 * caller can bypass every client-side cap (`RichTextEditor`'s `maxLength`,
 * `HashtagInput`/`ImageUpload`'s `max`) by calling the action's serialized
 * form directly — this re-enforces the SAME bounds (imported from
 * `kudos-compose-limits.ts`, never re-invented here) before a single row
 * reaches Postgres.
 *
 * Returns `null` when `input` is valid, or a stable error code identifying
 * the first violation found. Never throws.
 */
export function validateCreateKudosInput(
  input: CreateKudosInput,
): CreateKudosValidationError | null {
  if (typeof input.title !== "string" || input.title.trim().length === 0) {
    return "invalid_title";
  }
  if (typeof input.content !== "string" || input.content.trim().length === 0) {
    return "invalid_content";
  }
  if (input.content.length > KUDOS_CONTENT_MAX_LENGTH) {
    return "content_too_long";
  }

  if (
    !Array.isArray(input.hashtags) ||
    !input.hashtags.every((tag) => typeof tag === "string")
  ) {
    return "invalid_hashtags";
  }
  if (input.hashtags.length > KUDOS_HASHTAGS_MAX_COUNT) {
    return "too_many_hashtags";
  }

  if (
    !(
      Array.isArray(input.imageUrls) &&
      input.imageUrls.every((url) => typeof url === "string" && url.trim().length > 0)
    )
  ) {
    return "invalid_image_urls";
  }
  if (input.imageUrls.length > KUDOS_IMAGES_MAX_COUNT) {
    return "too_many_images";
  }

  if (
    typeof input.receiverId !== "string" ||
    input.receiverId.trim().length === 0
  ) {
    return "invalid_recipient";
  }

  if (typeof input.isAnonymous !== "boolean") {
    return "invalid_anonymous_flag";
  }
  if (
    typeof input.anonymousName !== "string" ||
    (input.isAnonymous && input.anonymousName.trim().length === 0)
  ) {
    return "invalid_anonymous_name";
  }

  return null;
}
