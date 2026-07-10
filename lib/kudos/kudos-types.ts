/**
 * Shared type definitions for the Sun* Kudos live board (F006).
 *
 * This module is types-only (no runtime code) — the mock dataset lives in
 * `kudos-data.ts`, pure shaping functions live in `kudos-selectors.ts`.
 */

/** One side (sender or recipient) of a Kudos post. */
export interface KudosPerson {
  id?: string;
  name: string;
  department: string;
  /** Star/recognition count shown next to the person in the card header. */
  stars: number;
  avatarUrl?: string;
}

/**
 * One Kudos entry. `timestamp` is a pre-formatted display string
 * (`HH:mm - MM/DD/YYYY`, FR-13) — no date library involved (YAGNI, mirrors
 * `homepage.hero.eventDate` being a literal).
 */
export interface KudosPost {
  id: string;
  sender: KudosPerson;
  recipient: KudosPerson;
  timestamp: string;
  content: string;
  hashtags: string[];
  /** Number of placeholder gallery tiles to render (0–5). */
  imageCount: number;
  /** Uploaded image URLs from Supabase Storage. */
  imageUrls?: string[];
  /** Static "everyone else's" like count — the current viewer's own like
   * (F008) is tracked separately (`likedIds` state owned by
   * `KudosPageClient`, seeded from `getLikedPostIds` so it survives a
   * reload — not session-only) and added on top when displayed; this field
   * itself is never mutated. */
  hearts: number;
  /**
   * "Danh hiệu" — optional Kudos headline set by the compose form (F007,
   * FR-5). Optional so every F006 post (none of which has one) keeps
   * compiling/rendering unchanged; `KudosCard` only renders the line when
   * present.
   */
  title?: string;
  /**
   * True for every post composed by the current viewer in this session
   * (F007's `buildKudosPost` sets it, even for anonymous posts) — lets
   * `canLikeKudos` block self-likes without relying on name comparison,
   * which an anonymous nickname could otherwise defeat. Undefined for the
   * F006 seed dataset (`kudos-data.ts`), which has no notion of "current
   * viewer authored this".
   */
  sentByCurrentUser?: boolean;
  /**
   * True when this post was submitted via the anonymous toggle — tells
   * `canLikeKudos` to skip the sender-name comparison for this post (an
   * anonymous nickname that happens to match another viewer's real name
   * must not false-block that viewer from liking it).
   */
  anonymous?: boolean;
}

/**
 * Static mock stats for the sidebar (FR-18). Modeled as named numeric
 * fields (not a generic list) so it maps 1:1 onto
 * `dictionary.kudos.stats.*` labels in `kudos-stats-box.tsx`.
 */
export interface KudosStats {
  received: number;
  sent: number;
  hearts: number;
  secretBoxOpened: number;
  secretBoxUnopened: number;
}

/** One row of the "10 Sunner nhận quà mới nhất" list (FR-20). */
export interface GiftRecipient {
  name: string;
  gift: string;
}

/**
 * The single filter-state shape shared by the board (owner, Phase 08) and
 * the pure `filterKudos` selector. `null` means "all" for that dimension.
 */
export interface KudosFilterState {
  hashtag: string | null;
  department: string | null;
}
