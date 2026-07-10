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
 * Structure re-verified 2026-07-10 directly against live MoMorph
 * (`get_node_context` on `2940:13453` "Header Giải thưởng", screen
 * `MaZUn5xHXZ`): subtitle (1152 wide) and the divider (1152 wide) stack
 * above a SEPARATE row (`Frame 488`, 1152 wide, `justify-content:
 * space-between`) that holds ONLY the title (564px, auto) and, for the
 * Highlight section, the filter buttons (`Buttons`, 302px) beside it —
 * title and `trailingSlot` do not share the subtitle/divider's own
 * full-width block. Previously the whole subtitle+divider+title block was
 * one `w-full` div sitting as a flex sibling of the filters, which left no
 * room for the filters and forced them onto their own line.
 *
 * Pure presentational — no directive, safe on the server tree.
 */

import { cn } from "@/lib/ui/cn";

export interface KudosSectionHeadingProps {
  subtitle: string;
  title: string;
  className?: string;
  /** Renders beside `title` in its own row (MoMorph `Buttons`, 302px) —
   * only the Highlight section passes this (its `KudosFilters`); Spotlight
   * and All Kudos omit it and the title row just holds the title alone. */
  trailingSlot?: React.ReactNode;
}

export function KudosSectionHeading({
  subtitle,
  title,
  className,
  trailingSlot,
}: KudosSectionHeadingProps) {
  return (
    <div className={cn("flex w-full flex-col items-start gap-3", className)}>
      <p className="font-montserrat text-2xl leading-8 font-bold text-white">{subtitle}</p>
      {/* Divider under subtitle, full content width, per MoMorph ground truth. */}
      <div className="h-px w-full bg-[#2E3940]" />
      <div className="flex w-full flex-row flex-wrap items-center justify-between gap-4">
        <h2 className="font-montserrat text-[57px] leading-[64px] font-bold tracking-[-0.25px] text-[#FFEA9E]">
          {title}
        </h2>
        {trailingSlot}
      </div>
    </div>
  );
}
