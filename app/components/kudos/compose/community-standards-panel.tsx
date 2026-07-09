"use client";

import type { RefObject } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { COLLECTION_ICONS, HERO_TIER_IDS, splitHeadingAndBody } from "./community-standards-content";

type CommunityStandardsLabels = Dictionary["kudos"]["compose"]["communityStandards"];

export interface CommunityStandardsPanelProps {
  labels: CommunityStandardsLabels;
  containerRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onCompose: () => void;
}

/** One Hero-tier row — reuses the exact "danh hiệu" pill style already
 * shipped for `KudosPersonBlock` (F008, MoMorph component set
 * `3007:17505`) so the two already-verified pixel values stay in sync. */
function HeroTierRow({ tier }: { tier: CommunityStandardsLabels["heroTiers"][number] }) {
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className="rounded-full border-[0.5px] border-[#FFEA9E] bg-[rgba(9,36,50,0.5)] px-2 py-0.5 text-[11.4px] font-bold text-white">
        {tier.name}
      </span>
      <span className="text-base leading-6 font-bold tracking-[0.5px] text-[#00101A]">{tier.condition}</span>
      <p className="w-full text-sm leading-5 font-bold tracking-[0.1px] text-[#00101A]">{tier.description}</p>
    </div>
  );
}

/** One collection-icon swatch — initials-in-colored-circle substitute for
 * the un-exportable Figma badge illustrations (`community-standards-content.ts`
 * doc comment), same convention as `avatar.tsx`'s people avatars. */
function CollectionIconTile({ icon, name }: { icon: (typeof COLLECTION_ICONS)[number]; name: string }) {
  return (
    <div className="flex w-20 flex-col items-center gap-2 text-center">
      <span
        aria-hidden="true"
        className="flex h-16 w-16 items-center justify-center rounded-full text-sm font-bold text-[#00101A]"
        style={{ backgroundColor: icon.color }}
      >
        {icon.initials}
      </span>
      <span className="text-xs font-bold uppercase text-[#00101A]">{name}</span>
    </div>
  );
}

/**
 * "Thể lệ" real Community Standards panel (F007, FR-23, revises FR-10) —
 * MoMorph `b1Filzi9i6` ("Thể lệ UPDATE", done). Static content only
 * (BR-2): no real Hero-badge computation, the badge pill on `KudosCard`
 * (F008) already renders statically from mock data and is unaffected.
 *
 * Ground truth measured via `get_node`/`query_section` on `b1Filzi9i6`
 * gives panel surface `rgba(0, 7, 12, 1)`, gold `#FFEA9E` headings, white
 * body text — i.e. this app's existing DARK palette (the one
 * `open-gift-button.tsx`'s pre-restyle Secret Box dialog already uses),
 * not the cream `#FFF8E1` FR-22 restyle. The phase brief's "cream theme"
 * note predates this measurement; the dark values above are the
 * MCP-verified ground truth and take precedence per this plan's own
 * pixel-conformance mandate. Renders as this app's established centered
 * modal shell (`ComposeDialog`/`OpenGiftButton`: `fixed inset-0` + centered
 * card) rather than the Figma frame's fixed 553px right-side drawer, since
 * no other dialog in this codebase uses that shape (KISS — one modal
 * pattern, not two).
 */
export function CommunityStandardsPanel({ labels, containerRef, onClose, onCompose }: CommunityStandardsPanelProps) {
  const recipient = splitHeadingAndBody(labels.recipientHeading);
  const sender = splitHeadingAndBody(labels.senderHeading);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={labels.panelTitle}
        tabIndex={-1}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-6 overflow-y-auto rounded-2xl bg-[#FFF8E1] p-6 text-[#00101A] outline-none"
      >
        <h2 className="font-montserrat text-[45px] leading-[52px] font-bold text-[#00101A]">{labels.panelTitle}</h2>

        <section className="flex flex-col gap-4">
          <h3 className="font-montserrat text-[22px] leading-7 font-bold uppercase text-[#00101A]">
            {recipient.heading}
          </h3>
          {recipient.body && (
            <p className="text-base leading-6 font-bold tracking-[0.5px] text-[#00101A]">{recipient.body}</p>
          )}
          <div className="flex flex-col gap-4">
            {labels.heroTiers.map((tier, index) => (
              <HeroTierRow key={HERO_TIER_IDS[index] ?? tier.name} tier={tier} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="font-montserrat text-[22px] leading-7 font-bold uppercase text-[#00101A]">
            {sender.heading}
          </h3>
          {sender.body && (
            <p className="text-base leading-6 font-bold tracking-[0.5px] text-[#00101A]">{sender.body}</p>
          )}
          <div className="flex flex-wrap gap-4">
            {COLLECTION_ICONS.map((icon, index) => (
              <CollectionIconTile key={icon.id} icon={icon} name={labels.collectionIcons[index] ?? icon.id} />
            ))}
          </div>
          <p className="text-base leading-6 font-bold tracking-[0.5px] text-[#00101A]">{labels.collectFullSetText}</p>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="font-montserrat text-[22px] leading-7 font-bold uppercase text-[#00101A]">
            {labels.nationalHeading}
          </h3>
          <p className="text-base leading-6 font-bold tracking-[0.5px] text-[#00101A]">{labels.nationalText}</p>
        </section>

        <div className="flex items-center gap-4 border-t border-[#2E3940] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#998C5F] bg-[#FFEA9E]/10 px-4 py-4 text-sm font-bold text-[#00101A] hover:bg-[#FFEA9E]/20"
          >
            {labels.footerClose}
          </button>
          <button
            type="button"
            onClick={onCompose}
            className="flex-1 rounded-lg bg-[#FFEA9E] px-4 py-4 text-base font-bold text-[#00101A] hover:opacity-90"
          >
            {labels.footerCompose}
          </button>
        </div>
      </div>
    </div>
  );
}
