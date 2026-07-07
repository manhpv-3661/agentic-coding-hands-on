/**
 * Inline `currentColor`-driven SVG icons shared by `KudosCard` and its
 * "Copy Link" action (extracted from `kudos-card.tsx` to keep it under the
 * 200-line budget). All pure/stateless — safe on the server tree.
 */

/** Sender→recipient arrow between the two `KudosPersonBlock`s. Ground truth
 * (`I3127:21871;256:5147` / `I2940:13464;335:9445`) is 32x32 in both card
 * variants. */
export function SentArrowIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M4 12H20M20 12L14 6M20 12L14 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** `filled` toggles solid (liked / legacy static) vs. outline (F008
 * not-yet-liked). Color is driven entirely by the caller's `currentColor`
 * wrapper — gray when inactive, red `#D4271D` when liked (design ground
 * truth: gray-inactive/red-active heart fill). Default size is 32x32
 * (`I3127:21871;256:5171` / `I2940:13464;335:9464`, both card variants);
 * `className` lets callers (e.g. the stats-box "x2" badge) resize it. */
export function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={filled ? undefined : "2"}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 21C12 21 4 15.5 4 9.5C4 6.5 6.5 4.5 9 4.5C10.5 4.5 11.5 5.2 12 6C12.5 5.2 13.5 4.5 15 4.5C17.5 4.5 20 6.5 20 9.5C20 15.5 12 21 12 21Z" />
    </svg>
  );
}

/** Decorative 32px "edit" pencil beside the feed-card title (design node
 * `I3127:21871;2234:33040`) — no click handler, mirrors the composer
 * pill's pencil precedent in `kudos-banner.tsx`. */
export function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4 20L4.5 16.5L15 6L18 9L7.5 19.5L4 20Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Trailing 24px icon on "Xem chi tiết" (design: text buttons end in a
 * link/arrow icon). */
export function ArrowRightIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Trailing 24px icon on "Copy Link" (design: text buttons end in a
 * link/arrow icon). */
export function LinkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M10 14L14 10M8 12L5.5 14.5C4.12 15.88 4.12 18.12 5.5 19.5C6.88 20.88 9.12 20.88 10.5 19.5L13 17M16 12L18.5 9.5C19.88 8.12 19.88 5.88 18.5 4.5C17.12 3.12 14.88 3.12 13.5 4.5L11 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
