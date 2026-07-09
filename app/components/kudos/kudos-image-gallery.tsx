/**
 * Photo gallery for a Kudos feed card (FR-13). MoMorph's gallery nodes
 * (`MM_MEDIA_Sample Image`, e.g. `I3127:21871;256:5177;513:8436`) DO carry
 * a real image fill (confirmed via `get_node`, same finding as `avatar.tsx`
 * — contrary to `clarifications.md`'s "plain RECTANGLE placeholders, not
 * exported images"). Direct export still 401s. The one remaining lead —
 * fetching the `get_node`-embedded `background: url(...)` directly — was
 * attempted once (phase-02, 2026-07-07) and also fails: MoMorph returns the
 * literal redacted token `<path-to-image>`, not a real asset URL, so it is
 * not retried. So `/public/kudos/gallery/photo-1.jpg` is a crop of the
 * design's own full-page render — every sampled gallery tile across the
 * whole design is the exact same repeated team photo, so one image is the
 * full pool, not a simplification.
 *
 * Pure presentational — safe on the server tree.
 */

import Image from "next/image";

export interface KudosImageGalleryProps {
  /** Number of attachment tiles to render, capped at 5 (design maximum). */
  count: number;
  imageUrls?: string[];
  className?: string;
}

const GALLERY_PHOTO = "/kudos/gallery/photo-1.jpg";

/**
 * Tile sizing/border treatment matches the design's photo thumbnail row
 * (MoMorph ground truth, researcher-260707-0110 §1b): outer 88×88 white
 * frame radius 18px + 1px `#998C5F` border, inner photo radius 4px + 1px
 * `#FFEA9E` border, 16px gap between tiles. The inner photo fills the full
 * 88×88 outer frame with zero inset (node `I3127:21871;256:5177` and its
 * child share the identical bounding box) — only the radius mismatch
 * (18px outer vs 4px inner) shows thin corner nicks, not a uniform margin.
 */
export function KudosImageGallery({ count, imageUrls, className }: KudosImageGalleryProps) {
  const tileCount = Math.min(Math.max(count, 0), 5);
  if (tileCount === 0) return null;

  return (
    <div className={`flex flex-wrap gap-4 ${className ?? ""}`}>
      {Array.from({ length: tileCount }).map((_, index) => (
        <div
          key={index}
          data-testid="kudos-image-tile"
          className="flex h-22 w-22 items-center justify-center rounded-[18px] border border-[#998C5F] bg-white"
        >
          <Image
            src={imageUrls?.[index] ?? GALLERY_PHOTO}
            alt=""
            aria-hidden="true"
            width={88}
            height={88}
            className="h-full w-full rounded-sm border border-[#FFEA9E] object-cover"
          />
        </div>
      ))}
    </div>
  );
}
