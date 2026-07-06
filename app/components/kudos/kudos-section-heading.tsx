/**
 * Shared section heading — subtitle + gold title — repeated 3x on the
 * Kudos board (Highlight, Spotlight, All Kudos) so it is extracted here
 * once (DRY) instead of duplicated per section.
 *
 * `subtitle` ("Sun* Annual Awards 2025") and `title` (the English design
 * label, e.g. "HIGHLIGHT KUDOS") are both hardcoded literals passed in by
 * each caller — brand/English design labels stay out of the i18n
 * dictionary per clarifications.md. `page.tsx` supplies the `h1` via the
 * banner, so section titles use `h2`.
 *
 * Pure presentational — no directive, safe on the server tree.
 */

export interface KudosSectionHeadingProps {
  subtitle: string;
  title: string;
  className?: string;
}

export function KudosSectionHeading({ subtitle, title, className }: KudosSectionHeadingProps) {
  return (
    <div className={`flex w-full flex-col items-start gap-2 ${className ?? ""}`}>
      <p className="font-montserrat text-sm font-bold tracking-[0.5px] text-white/70">
        {subtitle}
      </p>
      <h2 className="font-montserrat text-[28px] leading-9 font-bold tracking-[-0.25px] text-[#FFEA9E]">
        {title}
      </h2>
    </div>
  );
}
