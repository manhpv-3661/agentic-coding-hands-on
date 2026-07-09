import Image from "next/image";
import Link from "next/link";
import { GOLD_GLOW_BOX_SHADOW } from "@/lib/ui/gold-glow";
import { UpChevronIcon } from "./up-chevron-icon";

export interface AwardCardProps {
  /** Per-award thumbnail (background + gold-ring + name pre-composited),
   * cropped from the MoMorph full-frame render — distinct per award, same
   * asset reused from the awards detail page's `award-detail-data.ts`
   * (single-node export of this layer 401/500s, so the crop-from-full-render
   * fallback is used instead — same technique as the avatar/gallery fix). */
  thumbnailSrc: string;
  /** Award name — used as the thumbnail's alt text and repeated as the
   * plain-text heading rendered below the thumbnail. */
  titleAlt: string;
  /** Award description copy. */
  description: string;
  /** "Chi tiết" (details) link target. */
  detailsHref: string;
  /** "Chi tiết" / "Details" CTA label, shared with `sun-kudos-section.tsx`
   * (`shared.detailsCta`). */
  detailsCta: string;
}

/**
 * One award entry inside the "Hệ thống giải thưởng" grid.
 * MoMorph node: `214:1032` (mms_C2.x_*Award instance, e.g. `2167:9075`).
 *
 * The whole card (thumbnail, title, description, "Chi tiết") is a single
 * `Link` to `detailsHref` (`/awards#<slug>`) so clicking the image or the
 * title navigates exactly like clicking "Chi tiết" (FR-21) — a nested `<a>`
 * for "Chi tiết" would be invalid HTML, so that affordance is now a plain
 * `<span>` that keeps its original hover styling.
 *
 * FR-22 (TC ID-51): hovering anywhere on the card elevates the thumbnail
 * slightly and intensifies its gold glow — `group`/`group-hover` on the
 * `Link` so the whole card (not just the thumbnail) triggers it.
 */
export function AwardCard({
  thumbnailSrc,
  titleAlt,
  description,
  detailsHref,
  detailsCta,
}: AwardCardProps) {
  return (
    // mm:214:1032
    <Link
      href={detailsHref}
      className="group flex w-full flex-col items-start gap-6"
    >
      {/* mm:81:2443 — pre-composited thumbnail (background + gold-ring +
          name baked in), not a shared background with a text overlay. */}
      <div
        // Resting glow is the shared `GOLD_GLOW_BOX_SHADOW` token (inline
        // style); the hover-only, more-intense glow (FR-22) has no shared
        // equivalent, so it stays a Tailwind arbitrary-value class with a
        // `!` override — `!important` always wins over a plain inline
        // style, so this still swaps to the bigger glow on hover and back
        // to the shared token on mouse-leave (the box-shadow transition
        // fires normally regardless of which side is a class vs. inline
        // style).
        className="relative aspect-square w-full overflow-hidden rounded-3xl border-[0.955px] border-[#FFEA9E] transition-[transform,box-shadow] duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_8px_16px_0_rgba(0,0,0,0.35),0_0_14px_0_#FAE287]!"
        style={{ boxShadow: GOLD_GLOW_BOX_SHADOW }}
      >
        <Image
          src={thumbnailSrc}
          alt={titleAlt}
          fill
          sizes="(min-width: 1024px) 336px, 45vw"
          className="object-cover object-center"
        />
      </div>
      {/* mm:214:1020 */}
      <div className="flex w-full flex-col items-start gap-1">
        {/* mm:214:1021 */}
        <h3 className="font-montserrat w-full text-left text-[24px] leading-[32px] font-normal text-[#FFEA9E]">
          {titleAlt}
        </h3>
        {/* mm:214:1022 */}
        <p className="font-montserrat w-full text-left text-[16px] leading-[24px] font-normal tracking-[0.5px] text-white">
          {description}
        </p>
        {/* mm:186:1433 */}
        <span className="flex items-center gap-1 py-4 text-white transition-opacity duration-200 ease-out hover:opacity-70">
          {/* mm:186:1439 */}
          <span className="font-montserrat text-center text-[16px] leading-[24px] font-medium tracking-[0.15px]">
            {detailsCta}
          </span>
          {/* mm:I2167:9075;214:1023;186:1441 (shared master `178:1020`,
              instanced identically across all 6 award cards) */}
          <UpChevronIcon className="h-6 w-6" />
        </span>
      </div>
    </Link>
  );
}
