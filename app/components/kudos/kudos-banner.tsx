import type { DismissableMenuTriggerProps } from "@/hooks/use-dismissable-menu";
import { PencilIcon, SearchIcon } from "./kudos-card-icons";
import { ContentFrame, PageGutter } from "../layout/page-layout";

export interface KudosBannerLabels {
  title: string;
  /** "Tìm kiếm profile Sunner" — decorative search pill placeholder
   * (design node `B.7.3`-style pill repeated in the hero, MoMorph screen
   * MaZUn5xHXZ §2 Hero). Profile search/navigation is out of scope, so
   * the pill renders disabled — see `SearchPill` below. */
  searchPlaceholder: string;
}

export interface KudosComposerLabels {
  placeholder: string;
}

export interface KudosBannerProps {
  labels: KudosBannerLabels;
  composer: KudosComposerLabels;
  /**
   * F007 — the "Ghi nhận" pill's `useDismissableMenu` trigger props (open
   * the compose dialog). Optional so callers that don't wire a compose
   * flow keep the pill inert, exactly as F006 shipped it.
   */
  composerTriggerProps?: DismissableMenuTriggerProps;
}

/** Shared pill chrome per MoMorph ground truth: radius 68px (full pill),
 * border 1px #998C5F, bg rgba(255,234,158,0.10), padding 24px vertical /
 * 16px horizontal, 16px icon-to-label gap (node `I2940:13449;186:2758`,
 * "Frame 483"). */
const PILL_CLASS =
  "flex items-center gap-4 rounded-[68px] border border-[#998C5F] bg-[rgba(255,234,158,0.10)] px-4 py-6 text-left text-white";

/**
 * "Tìm kiếm profile Sunner" pill (MoMorph hero, `A_KV Kudos` search node).
 * Profile search/navigation is locked out of scope (clarifications.md),
 * so this renders as a real, disabled-style, no-op button — same pill
 * chrome as the composer trigger, `aria-disabled` so assistive tech
 * announces it as inert rather than a broken control.
 */
function SearchPill({ placeholder }: { placeholder: string }) {
  return (
    // No native `disabled` attribute: on a fully custom-styled button, some
    // browsers still paint their own default disabled-control chrome
    // underneath the Tailwind classes, rendering as a faint duplicate pill
    // (confirmed visually against ground truth, which shows exactly one).
    // `aria-disabled` + `tabIndex={-1}` + `pointer-events-none` gets the
    // same inert, unfocusable result without that native paint.
    <button
      type="button"
      aria-disabled="true"
      tabIndex={-1}
      className={`${PILL_CLASS} w-[381px] shrink-0 pointer-events-none`}
    >
      <SearchIcon size={24} />
      <span className="font-montserrat text-base leading-6 font-bold">{placeholder}</span>
    </button>
  );
}

/**
 * Static banner ("Hệ thống ghi nhận và cảm ơn" + "KUDOS" wordmark, FR-3)
 * + the "Ghi nhận" composer pill (FR-4). The banner itself stays
 * display-only; the pill opens the "Viết Kudos" compose dialog (F007) when
 * a caller supplies `composerTriggerProps` — inert otherwise (F006 default).
 *
 * Desktop-only layout fix (`plans/260709-0724-desktop-only-banner-overlay-fix/`
 * phase 05): rebuilt as an exactly-sized 1440×512 full-bleed band (mm:
 * "KV Background" `2940:13432`) carrying the keyvisual image + the "Cover"
 * gradient node (`1210:12612`) in paint order, with the title/wordmark +
 * pills overlay ABSOLUTELY positioned at `top:184` over that band (mm:
 * title block `144,184 → 1152×160`) — not stacked in flow above the pills
 * as the previous `flex-col` layout did. The overlay reuses `PageGutter`/
 * `ContentFrame(1152)` (the site's single-owner gutter/width primitives,
 * `../layout/page-layout.tsx`) so its 144px left/right inset always
 * matches the header/board gutter, instead of a locally hardcoded offset.
 *
 * Background: the MoMorph keyvisual (`I2940:13432;2167:5141`,
 * `MM_MEDIA_KV Background`) has no clean source export (`get_figma_image`/
 * `get_media_file` 401/500 for this node — same limitation documented on
 * `login/page.tsx`'s hero art). `/public/kudos/hero-waves.jpg` is a crop of
 * the design's own full-page render (x≥700, right-anchored) — a
 * reconstruction, not a pixel-exact export (Open Q #2). The Y-range is
 * deliberately a narrow band well above the composer/search pill row (not
 * the full hero height) — an earlier crop spanned down into the pill row
 * and baked a second, static copy of the search pill into the image itself,
 * which then visually doubled the real HTML pill rendered on top of it
 * (confirmed via live-browser screenshot vs. ground truth). Do not
 * re-crop the image to include the pills — the box below is sized exactly
 * (`h-[512px]`) and the pills are real HTML, not baked art. `bg-cover`
 * scales this artwork-only band to fill the fixed 512px band height. The
 * darkening scrim on top of it reproduces the ground-truth "Cover" node
 * exactly — a 25deg linear gradient from solid `#00101A` to transparent —
 * independent of the photo substitution.
 */
export function KudosBanner({ labels, composer, composerTriggerProps }: KudosBannerProps) {
  return (
    // mm:kudos-banner (mms_A / mms_A.1) — fixed 1440×512 full-bleed band.
    <div className="relative h-[512px] w-full overflow-hidden bg-[#00101A]">
      {/* Keyvisual layer (mm: "KV Background" `2940:13432`) — paint order:
       * image first, gradient over it, title/pills overlay on top. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-right bg-no-repeat"
        style={{ backgroundImage: "url('/kudos/hero-waves.jpg')" }}
      />

      {/* Cover gradient (mm: `1210:12612`) — 25deg linear gradient from
       * solid `#00101A` to transparent, painted over the keyvisual. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(25deg,#00101A_14.74%,rgba(0,19,32,0)_47.8%)]"
      />

      {/* Title/wordmark + pills overlay, absolutely positioned at top:184
       * within the shared 144px gutter / 1152px content width (mm: title
       * block `144,184 → 1152×160`) — overlays the band, does not sit in
       * flow above it. */}
      <PageGutter as="div" className="absolute inset-x-0 top-[184px]">
        <ContentFrame width={1152} className="flex flex-col items-start gap-16 text-center">
          <div className="flex flex-col items-center gap-2.5">
            <p className="font-montserrat text-[36px] leading-11 font-bold text-[#FFEA9E]">
              {labels.title}
            </p>
            {/* Brand wordmark — untranslated per clarifications.md. Ground
             * truth (node `2940:13441`) sets this in `SVN-Gotham`, a
             * commercial face not present in `app/fonts.ts`; kept on the
             * existing Montserrat stack but recolored to the design's
             * muted beige-gray (`#DBD1C1`) so it stays visually distinct
             * from the gold tagline above it, as the design intends.
             * Size/tracking matches ground truth's desktop-only ~140px
             * font / ~98px cap-height / -13% (~-18px) letter-spacing —
             * collapsed from the old responsive scale (site is
             * desktop-only, no breakpoint scaling). */}
            <p className="font-montserrat text-[140px] leading-[98px] tracking-[-18px] text-[#DBD1C1]">
              KUDOS
            </p>
          </div>

          {/* Hero pills, side by side per design (MoMorph §2 Hero): the
           * "Ghi nhận" composer trigger + the decorative search pill. */}
          <div className="flex w-full items-center gap-[33px]">
            {/* F007: when `composerTriggerProps` is supplied, this pill
             * opens the "Viết Kudos" compose dialog (spread onto the
             * button). Omitted = inert, exactly as F006 originally
             * shipped it. */}
            <button
              type="button"
              {...composerTriggerProps}
              className={`${PILL_CLASS} w-[738px] shrink-0`}
            >
              <PencilIcon size={24} />
              <span className="font-montserrat text-base leading-6 font-bold">
                {composer.placeholder}
              </span>
            </button>

            <SearchPill placeholder={labels.searchPlaceholder} />
          </div>
        </ContentFrame>
      </PageGutter>
    </div>
  );
}
