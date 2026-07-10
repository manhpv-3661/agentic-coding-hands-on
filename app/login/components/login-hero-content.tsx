import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Introduction content block: "ROOT FURTHER" wordmark, subtitle/tagline copy,
 * and a slot for the login button.
 * MoMorph node: `662:14394` (Frame 487) → `662:14395` (Key Visual) +
 * `662:14755` (Frame 550, text + button).
 *
 * @param subtitle - dict-sourced tagline (`login.hero.subtitle`). Carries an
 *   embedded `\n` line break — rendered via `whitespace-pre-line` below, so
 *   the wrapping markup is preserved regardless of locale.
 */
export function LoginHeroContent({
  subtitle,
  children,
}: {
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-20">
      <Image
        src="/login/Root_Further_Logo.png"
        alt="Root Further"
        width={451}
        height={200}
        priority
        className="h-auto w-[451px]"
      />
      <div className="flex flex-col items-start gap-6 pl-4">
        {/* max-w-[480px] confirmed 2026-07-10 directly against live MoMorph
         * (`get_node`, screen GzbNeVGJHz): the subtitle TEXT node itself
         * (`662:14753`) declares `width: 480px` — this is the text node's
         * own bounding box, not an outer frame's padding property, so
         * there's no parent/child ambiguity to cross-check here. Correct
         * as-is; do not re-flag as an open question. */}
        <p className="font-montserrat max-w-[480px] text-[20px] leading-[40px] font-bold tracking-[0.5px] whitespace-pre-line text-white">
          {subtitle}
        </p>
        {children}
      </div>
    </div>
  );
}
