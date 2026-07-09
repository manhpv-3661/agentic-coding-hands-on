/**
 * Deterministic avatar for the Kudos live board (F006): a real mock photo
 * picked by a stable hash of `name`, falling back to an initials-in-a-
 * colored-circle when no photo is available. Shared by every avatar spot
 * (card header, spotlight, top-10 recipients).
 *
 * Photo pool: MoMorph avatar nodes (`MM_MEDIA_Avatar`, e.g. `2940:13516`)
 * DO carry a real image fill (`background: url(...)`, confirmed via
 * `get_node` — contrary to an earlier session's `clarifications.md` entry
 * claiming "plain ELLIPSE placeholders, not exported images"). Direct
 * export (`get_figma_image`/`get_media_file`) still 401s for this file.
 * The one remaining lead — fetching the `get_node`-embedded
 * `background: url(...)` directly — was attempted once (phase-02,
 * 2026-07-07) and also fails: MoMorph returns the literal redacted token
 * `<path-to-image>`, not a real asset URL, so it is not retried. So
 * `/public/kudos/avatars/avatar-{1,2,3}.jpg` are crops of the design's own
 * full-page render — the design itself repeats just these 3 distinct
 * people across every mock avatar slot, so 3 is the full pool, not a
 * sample.
 *
 * Static info only — no `<Link>`, no `onClick` (profile routing is out of
 * scope, mirrors the "Profile" stub in `account-menu-button.tsx`).
 */

import Image from "next/image";
import { cn } from "@/lib/ui/cn";

export interface AvatarProps {
  /** Full display name — used to derive initials/color/photo and as the
   * accessible label. */
  name: string;
  /** Circle diameter in px. Defaults to 40 (typical card-header size). */
  size?: number;
  className?: string;
}

/** Fixed, stable color palette — index chosen by a pure hash of `name` so
 * the same person always renders the same color (no `Math.random`/`Date`,
 * which would cause a hydration mismatch between server and client
 * render). Used as the initials-circle fallback background. */
const PALETTE = [
  "#FFEA9E",
  "#8FD3FF",
  "#FFB0B0",
  "#B6F2C0",
  "#D7B8FF",
  "#FFD08A",
];

/** The full mock photo pool (see file header) — same 3 people reused for
 * every avatar slot, exactly mirroring how the Figma source repeats them. */
const AVATAR_PHOTOS = [
  "/kudos/avatars/avatar-1.jpg",
  "/kudos/avatars/avatar-2.jpg",
  "/kudos/avatars/avatar-3.jpg",
];

/** First letter of up to the first 2 words in `name`, uppercased. Falls
 * back to "?" for an empty/blank name. Internal — exercised only through
 * `Avatar`'s rendered output (see `avatar.test.tsx`), not exported. */
function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/** Deterministic char-code sum, shared by `colorFor`/`photoFor` so both
 * derive from the exact same hash of `name`. */
function hashSum(name: string): number {
  return name.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

/** Deterministic palette index derived from the sum of `name`'s char codes.
 * Internal — see `initials` above for the export-scope rationale. */
function colorFor(name: string): string {
  return PALETTE[hashSum(name) % PALETTE.length];
}

/** Deterministic photo pick from the 3-person pool, keyed off `name` (same
 * hash as `colorFor`, different modulus). Empty `name` (e.g. an anonymous
 * sender with no identity yet) gets no photo — initials fallback instead.
 * Internal — see `initials` above for the export-scope rationale. */
function photoFor(name: string): string | null {
  if (!name.trim()) return null;
  return AVATAR_PHOTOS[hashSum(name) % AVATAR_PHOTOS.length];
}

export function Avatar({ name, size = 40, className }: AvatarProps) {
  const photo = photoFor(name);

  if (photo) {
    return (
      <Image
        src={photo}
        alt={name}
        width={size}
        height={size}
        className={cn("inline-flex shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-[#00101A]",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: colorFor(name),
        fontSize: Math.max(10, Math.round(size * 0.4)),
      }}
    >
      {initials(name)}
    </span>
  );
}
