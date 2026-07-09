/**
 * Shared section heading — subtitle + gold title — repeated 3x on the
 * Kudos board (Highlight, Spotlight, All Kudos) so it is extracted here
 * once (DRY) instead of duplicated per section.
 *
 * `subtitle` ("Sun* Annual Awards 2025") is the one hardcoded literal here —
 * the brand+year caption stays out of the i18n dictionary per
 * clarifications.md. `title` (e.g. "HIGHLIGHT KUDOS" / "ALL KUDOS" /
 * "SPOTLIGHT BOARD") is NOT an exception: it is dictionary-driven
 * (`kudos.sections.*`) — each caller resolves the locale's translated label
 * and passes it in as a plain prop; English section headings are not an
 * exempt category. `page.tsx` supplies the `h1` via the banner, so section
 * titles use `h2`.
 *
 * Pure presentational — no directive, safe on the server tree.
 */

import { cn } from "@/lib/ui/cn";

export interface KudosSectionHeadingProps {
  subtitle: string;
  title: string;
  className?: string;
}

export function KudosSectionHeading({ subtitle, title, className }: KudosSectionHeadingProps) {
  return (
    <div className={cn("flex w-full flex-col items-start gap-3", className)}>
      <p className="font-montserrat text-2xl leading-8 font-bold text-white">{subtitle}</p>
      {/* Divider under subtitle, full content width, per MoMorph ground truth. */}
      <div className="h-px w-full bg-[#2E3940]" />
      <h2 className="font-montserrat text-[57px] leading-[64px] font-bold tracking-[-0.25px] text-[#FFEA9E]">
        {title}
      </h2>
    </div>
  );
}
