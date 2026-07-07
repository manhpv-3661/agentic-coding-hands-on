import { formatKudosTimestamp } from "@/lib/kudos/format-kudos-timestamp";
import type { KudosPerson, KudosPost } from "@/lib/kudos/kudos-types";

/** All compose-dialog field values (F007) in one shape, so
 * validate/build/reset can operate on a single object instead of many
 * separate `useState` calls threaded around. */
export interface ComposeFormState {
  recipient: KudosPerson | null;
  title: string;
  content: string;
  hashtags: string[];
  images: File[];
  anonymous: boolean;
  nickname: string;
}

export const EMPTY_COMPOSE_FORM_STATE: ComposeFormState = {
  recipient: null,
  title: "",
  content: "",
  hashtags: [],
  images: [],
  anonymous: false,
  nickname: "",
};

export interface ComposeFormErrors {
  recipient?: string;
  title?: string;
  content?: string;
  hashtags?: string;
  nickname?: string;
}

export interface ComposeFormErrorMessages {
  recipient: string;
  title: string;
  content: string;
  hashtags: string;
  nickname: string;
}

/**
 * Required-field validation (F007, FR-4/9/13/19): recipient, title,
 * content, and at least 1 hashtag are always required; nickname is
 * required only while `anonymous` is checked. Pure — no side effects, easy
 * to unit test independent of the dialog's rendering.
 */
export function validateComposeForm(
  state: ComposeFormState,
  messages: ComposeFormErrorMessages,
): ComposeFormErrors {
  const errors: ComposeFormErrors = {};

  if (!state.recipient) errors.recipient = messages.recipient;
  if (!state.title.trim()) errors.title = messages.title;
  if (!state.content.trim()) errors.content = messages.content;
  if (state.hashtags.length === 0) errors.hashtags = messages.hashtags;
  if (state.anonymous && !state.nickname.trim()) errors.nickname = messages.nickname;

  return errors;
}

// Monotonic counter, module-scoped: `Date.now()` alone collides when two
// posts are built within the same millisecond (e.g. a double-submit race
// or two rapid composes) — appending an ever-incrementing counter makes
// every id unique regardless of timing.
let composeSequence = 0;

/**
 * Builds the `KudosPost` to prepend on a valid submit (F007, FR-18/21).
 * Callers MUST run `validateComposeForm` first — `state.recipient` is
 * assumed non-null here (validated, not re-checked).
 */
export function buildKudosPost(
  state: ComposeFormState,
  currentUser: KudosPerson,
  now: Date,
): KudosPost {
  composeSequence += 1;

  return {
    id: `kudos-new-${now.getTime()}-${composeSequence}`,
    sender: state.anonymous
      ? { name: state.nickname.trim(), department: "", stars: 0 }
      : currentUser,
    recipient: state.recipient as KudosPerson,
    title: state.title.trim(),
    timestamp: formatKudosTimestamp(now),
    content: state.content.trim(),
    hashtags: state.hashtags,
    imageCount: state.images.length,
    hearts: 0,
    // Bug fix (self-like loophole): every composed post — anonymous or
    // not — is authored by `currentUser`, so `canLikeKudos` can block the
    // author from liking their own post even when they posted under a
    // nickname (see `lib/kudos/kudos-selectors.ts`).
    sentByCurrentUser: true,
    anonymous: state.anonymous,
  };
}
