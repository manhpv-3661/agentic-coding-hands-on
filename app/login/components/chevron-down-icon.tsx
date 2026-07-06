/**
 * Chevron-down icon used by the language selector trigger.
 * Inlined as SVG (rather than <img src="/login/Down.svg" />) so it can pick
 * up `currentColor` and rotate via CSS when the dropdown is open.
 * Source: MoMorph node `I662:14391;186:1696;186:1821;186:1441` (MM_MEDIA_Down).
 */
export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
    </svg>
  );
}
