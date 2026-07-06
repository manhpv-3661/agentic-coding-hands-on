export interface KudosBannerLabels {
  title: string;
}

export interface KudosComposerLabels {
  placeholder: string;
}

export interface KudosBannerProps {
  labels: KudosBannerLabels;
  composer: KudosComposerLabels;
}

/** Pencil icon on the composer pill — `currentColor` inline SVG. */
function PencilIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20L4.5 16.5L15 6L18 9L7.5 19.5L4 20Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Static banner ("Hệ thống ghi nhận và cảm ơn" + "KUDOS" wordmark, FR-3)
 * + the "Ghi nhận" composer pill (FR-4). Both are display-only per
 * clarifications.md — the composer's click is a no-op (the "compose a new
 * Kudos" dialog is out of scope for this pass).
 */
export function KudosBanner({ labels, composer }: KudosBannerProps) {
  return (
    // mm:kudos-banner (mms_A / mms_A.1)
    <div className="flex w-full flex-col items-center gap-8 bg-gradient-to-br from-[#1B2A3A] via-[#2E3940] to-[#00101A] px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-2">
        <p className="font-montserrat text-lg font-bold text-white">{labels.title}</p>
        {/* Brand wordmark — untranslated per clarifications.md. */}
        <p className="font-montserrat text-[64px] leading-[72px] font-bold tracking-[-0.25px] text-[#FFEA9E]">
          KUDOS
        </p>
      </div>

      {/* Static — clicking is a no-op; the "send a new Kudos" dialog is
       * out of scope for this pass (clarifications.md). */}
      <button
        type="button"
        className="flex w-full max-w-xl items-center gap-3 rounded-full border border-white/20 bg-white/5 px-6 py-4 text-left text-white/70"
      >
        <PencilIcon />
        <span className="font-montserrat text-sm">{composer.placeholder}</span>
      </button>
    </div>
  );
}
