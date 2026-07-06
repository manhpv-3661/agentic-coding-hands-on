import Image from "next/image";
import Link from "next/link";

export interface AwardCardProps {
  /** Award photo behind the title graphic (same placeholder photo for every
   * award in the current design — that is intentional, not a data error). */
  thumbnailSrc: string;
  /** Stylized title graphic overlaid on the thumbnail (e.g. "Top Talent"). */
  titleImageSrc: string;
  /** Award name — used as the title image's alt text and repeated as the
   * plain-text heading rendered below the thumbnail. */
  titleAlt: string;
  /** Award description copy. */
  description: string;
  /** "Chi tiết" (details) link target. */
  detailsHref: string;
}

/**
 * Up-chevron icon on every "Chi tiết" details link in the awards grid.
 * Inlined (not `<img>`) so `currentColor` can be driven by CSS instead of
 * the hardcoded `fill="white"` baked into the exported SVG.
 * Shared master component `178:1020`, reused by all 6 award instances:
 */
// mm:I2167:9075;214:1023;186:1441
// mm:I2167:9076;214:1023;186:1441
// mm:I2167:9077;214:1023;186:1441
// mm:I2167:9079;214:1023;186:1441
// mm:I2167:9080;214:1023;186:1441
// mm:I2167:9081;214:1023;186:1441
function IconUp({ className }: { className?: string }) {
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
      <path
        d="M8.49945 18.3104L5.68945 15.5004L12.0595 9.12043H7.10945V5.69043H18.3095V16.8904H14.8895V11.9404L8.49945 18.3104Z"
        fill="currentColor"
      />
    </svg>
  );
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
 */
export function AwardCard({
  thumbnailSrc,
  titleImageSrc,
  titleAlt,
  description,
  detailsHref,
}: AwardCardProps) {
  return (
    // mm:214:1032
    <Link href={detailsHref} className="flex w-full flex-col items-start gap-6">
      {/* mm:81:2443 */}
      <div
        className="relative aspect-square w-full overflow-hidden rounded-3xl"
        style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25), 0 0 6px 0 #FAE287" }}
      >
        <div
          className="absolute inset-0 rounded-3xl border-[0.955px] border-[#FFEA9E] bg-no-repeat"
          style={{
            backgroundImage: `url(${thumbnailSrc})`,
            backgroundPosition: "-33.807px -26.646px",
            backgroundSize: "121.672% 123.049%",
          }}
        />
        {/* mm:214:664 */}
        <div className="absolute inset-0 flex items-center justify-center px-8">
          {/* Bounding box only — each award's title graphic has its own
           * intrinsic aspect ratio (e.g. 221x35 vs 116x52), so `fill` +
           * `object-contain` scales it correctly instead of assuming one
           * fixed width/height for all 6 assets. */}
          <div className="relative h-16 w-full max-w-[232px]">
            <Image
              src={titleImageSrc}
              alt={titleAlt}
              fill
              sizes="232px"
              className="object-contain object-center"
            />
          </div>
        </div>
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
            Chi tiết
          </span>
          <IconUp className="h-6 w-6" />
        </span>
      </div>
    </Link>
  );
}
