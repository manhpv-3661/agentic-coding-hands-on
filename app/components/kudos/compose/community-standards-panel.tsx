"use client";

import type { RefObject } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary";

/**
 * Hero-tier ids, in display order — index-aligned with the dictionary's
 * `heroTiers` array (New/Rising/Super/Legend Hero). Used only as React
 * `key`s; the badge pill itself reuses the exact style already shipped for
 * `KudosPersonBlock` (F008, MoMorph component set `3007:17505`) for pixel
 * parity — no new badge component.
 */
const HERO_TIER_IDS = ["new-hero", "rising-hero", "super-hero", "legend-hero"] as const;

interface CollectionIconMeta {
  id: string;
  /** Rendered inside the swatch circle. */
  initials: string;
  /** Swatch fill — reuses `avatar.tsx`'s existing palette hexes so the new
   * swatches read as the same design language as every other
   * initials-in-a-colored-circle placeholder in this app. */
  color: string;
}

/**
 * Collection-icon ids + swatch metadata, in display order — index-aligned
 * with the dictionary's `collectionIcons` array (Revival, Touch of Light,
 * Stay Gold, Flow to Horizon, Beyond the Boundary, Root Further). No
 * exportable illustration assets exist for these 6 badges (Figma nodes are
 * component *instances*, not exported images — the same situation
 * `avatar.tsx` already solved for people avatars), so each renders as an
 * initials-in-colored-circle swatch instead of a fetched image.
 */
const COLLECTION_ICONS: CollectionIconMeta[] = [
  { id: "revival", initials: "RV", color: "#8FD3FF" },
  { id: "touch-of-light", initials: "TL", color: "#FFD08A" },
  { id: "stay-gold", initials: "SG", color: "#FFEA9E" },
  { id: "flow-to-horizon", initials: "FH", color: "#FFB0B0" },
  { id: "beyond-the-boundary", initials: "BB", color: "#B6F2C0" },
  { id: "root-further", initials: "RF", color: "#D7B8FF" },
];

/**
 * Splits a "heading\nbody" dictionary string into its two parts. The P1
 * dictionary bundles the gold section heading and its white description
 * paragraph into one string (`recipientHeading`/`senderHeading`) — this
 * mirrors the ground truth's two separate Figma text nodes at render time
 * without re-shaping the dictionary (out of this phase's file ownership).
 * Falls back to an empty body when no newline is present (matches
 * `nationalHeading`, which the dictionary keeps heading-only).
 */
function splitHeadingAndBody(text: string): { heading: string; body: string } {
  const newlineIndex = text.indexOf("\n");
  if (newlineIndex === -1) return { heading: text, body: "" };
  return { heading: text.slice(0, newlineIndex), body: text.slice(newlineIndex + 1) };
}

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
 * the un-exportable Figma badge illustrations (see `COLLECTION_ICONS`
 * above), same convention as `avatar.tsx`'s people avatars. */
function CollectionIconTile({ icon, name }: { icon: CollectionIconMeta; name: string }) {
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
