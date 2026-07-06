/**
 * Generic placeholder image gallery for a Kudos feed card (FR-13). No real
 * gallery images exist for any mock post (clarifications.md — Figma nodes
 * are plain `RECTANGLE` placeholders, not exported images), so each tile
 * is a muted, icon-only placeholder rather than an invented photo.
 *
 * Pure presentational — safe on the server tree.
 */

export interface KudosImageGalleryProps {
  /** Number of attachment tiles to render, capped at 5 (design maximum). */
  count: number;
  className?: string;
}

function PlaceholderIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V5ZM6 15L9.5 11L12 13.5L16 9L18 15H6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function KudosImageGallery({ count, className }: KudosImageGalleryProps) {
  const tileCount = Math.min(Math.max(count, 0), 5);
  if (tileCount === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ""}`}>
      {Array.from({ length: tileCount }).map((_, index) => (
        <div
          key={index}
          data-testid="kudos-image-tile"
          className="flex h-16 w-16 items-center justify-center rounded-md bg-white/10 text-white/40"
          aria-hidden="true"
        >
          <PlaceholderIcon />
        </div>
      ))}
    </div>
  );
}
