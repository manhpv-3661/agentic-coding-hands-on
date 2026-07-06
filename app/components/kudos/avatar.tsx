/**
 * Deterministic initials-in-a-colored-circle avatar for the Kudos live
 * board (F006). No photo assets exist anywhere in this repo's pipeline for
 * mock people (clarifications.md — Figma avatar nodes are plain `ELLIPSE`
 * placeholders, not exported images), so this is the shared substitute
 * used by every avatar spot (card header, spotlight, top-10 recipients).
 *
 * Static info only — no `<Link>`, no `onClick` (profile routing is out of
 * scope, mirrors the "Profile" stub in `account-menu-button.tsx`).
 */

export interface AvatarProps {
  /** Full display name — used to derive initials/color and as the
   * accessible label. */
  name: string;
  /** Circle diameter in px. Defaults to 40 (typical card-header size). */
  size?: number;
  className?: string;
}

/** Fixed, stable color palette — index chosen by a pure hash of `name` so
 * the same person always renders the same color (no `Math.random`/`Date`,
 * which would cause a hydration mismatch between server and client
 * render). */
const PALETTE = [
  "#FFEA9E",
  "#8FD3FF",
  "#FFB0B0",
  "#B6F2C0",
  "#D7B8FF",
  "#FFD08A",
];

/** First letter of up to the first 2 words in `name`, uppercased. Falls
 * back to "?" for an empty/blank name. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/** Deterministic palette index derived from the sum of `name`'s char codes. */
export function colorFor(name: string): string {
  const sum = name.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return PALETTE[sum % PALETTE.length];
}

export function Avatar({ name, size = 40, className }: AvatarProps) {
  return (
    <span
      role="img"
      aria-label={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-[#00101A] ${className ?? ""}`}
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
