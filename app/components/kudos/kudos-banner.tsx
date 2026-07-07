import type { DismissableMenuTriggerProps } from "@/hooks/use-dismissable-menu";

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
  "flex flex-1 items-center gap-4 rounded-[68px] border border-[#998C5F] bg-[rgba(255,234,158,0.10)] px-4 py-6 text-left text-white";

/** Pencil icon on the composer pill — `currentColor` inline SVG, 24px per design. */
function PencilIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20L4.5 16.5L15 6L18 9L7.5 19.5L4 20Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Magnifier icon on the search pill — `currentColor` inline SVG, 24px per design. */
function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 20L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

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
      className={`${PILL_CLASS} pointer-events-none sm:max-w-sm`}
    >
      <SearchIcon />
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
 * Background: the MoMorph keyvisual (`I2940:13432;2167:5141`,
 * `MM_MEDIA_KV Background`) has no clean source export (`get_figma_image`/
 * `get_media_file` 401/500 for this node — same limitation documented on
 * `login/page.tsx`'s hero art). `/public/kudos/hero-waves.jpg` is a crop of
 * the design's own full-page render (x≥700, right-anchored). The Y-range is
 * deliberately a narrow band well above the composer/search pill row (not
 * the full hero height) — an earlier crop spanned down into the pill row
 * and baked a second, static copy of the search pill into the image itself,
 * which then visually doubled the real HTML pill rendered on top of it
 * (confirmed via live-browser screenshot vs. ground truth). `bg-cover`
 * scales this artwork-only band to fill the actual hero height. The
 * darkening scrim on top of it reproduces the ground-truth "Cover" node
 * (`I2940:13432;1210:12612`) exactly — a 25deg linear gradient from solid
 * `#00101A` to fully transparent — independent of the photo substitution.
 */
export function KudosBanner({ labels, composer, composerTriggerProps }: KudosBannerProps) {
  return (
    // mm:kudos-banner (mms_A / mms_A.1)
    <div
      className="flex w-full flex-col items-center gap-16 bg-[linear-gradient(25deg,rgba(0,16,26,1)_14.74%,rgba(0,16,26,0)_47.8%),url('/kudos/hero-waves.jpg')] bg-[#00101A] bg-cover bg-right bg-no-repeat px-6 py-16 text-center"
    >
      <div className="flex flex-col items-center gap-2.5">
        <p className="font-montserrat text-[36px] leading-11 font-bold text-[#FFEA9E]">
          {labels.title}
        </p>
        {/* Brand wordmark — untranslated per clarifications.md. Ground truth
         * (node `2940:13441`) sets this in `SVN-Gotham`, a commercial face
         * not present in `app/fonts.ts`; kept on the existing Montserrat
         * stack but recolored to the design's muted beige-gray (`#DBD1C1`)
         * so it stays visually distinct from the gold tagline above it,
         * as the design intends. Size/tracking matches ground truth's
         * ~140px font / ~98px cap-height / -13% (~-18px) letter-spacing;
         * scaled down on narrow viewports since the 1440px-wide desktop
         * canvas has no responsive spec of its own. */}
        <p className="font-montserrat text-[64px] leading-[45px] font-bold tracking-[-8px] text-[#DBD1C1] sm:text-[96px] sm:leading-[67px] sm:tracking-[-12px] lg:text-[140px] lg:leading-[98px] lg:tracking-[-18px]">
          KUDOS
        </p>
      </div>

      {/* Hero pills, side by side per design (MoMorph §2 Hero): the
       * "Ghi nhận" composer trigger + the decorative search pill. */}
      <div className="flex w-full max-w-4xl flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
        {/* F007: when `composerTriggerProps` is supplied, this pill opens
         * the "Viết Kudos" compose dialog (spread onto the button). Omitted
         * = inert, exactly as F006 originally shipped it. */}
        <button type="button" {...composerTriggerProps} className={PILL_CLASS}>
          <PencilIcon />
          <span className="font-montserrat text-base leading-6 font-bold">
            {composer.placeholder}
          </span>
        </button>

        <SearchPill placeholder={labels.searchPlaceholder} />
      </div>
    </div>
  );
}
