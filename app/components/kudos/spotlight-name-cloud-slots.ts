export const SPOTLIGHT_NAME_SIZES = [
  "text-[6.656px]",
  "text-[7.937px]",
  "text-[10.205px]",
  "text-[11.339px]",
] as const;

export type SpotlightNameSize = (typeof SPOTLIGHT_NAME_SIZES)[number];

export interface SpotlightNameSlot {
  top: string;
  left: string;
  size: SpotlightNameSize;
  tone?: "white" | "accent";
}

/**
 * Fixed production slots for the static Spotlight mock dataset.
 *
 * This board is design-driven mock content, not a real dynamic word cloud, so
 * the 24 shipped names render into 24 pre-curated slots instead of a runtime
 * layout algorithm. That keeps the texture stable across renders and makes the
 * screen audit-friendly: every production name now has one canonical position.
 */
export const SPOTLIGHT_NAME_SLOTS: SpotlightNameSlot[] = [
  { top: "49.0%", left: "56.1%", size: "text-[7.937px]", tone: "accent" },
  { top: "56.8%", left: "42.3%", size: "text-[6.656px]" },
  { top: "34.2%", left: "51.2%", size: "text-[6.656px]" },
  { top: "62.9%", left: "59.8%", size: "text-[6.656px]" },
  { top: "45.5%", left: "32.1%", size: "text-[6.656px]" },
  { top: "37.2%", left: "67.0%", size: "text-[6.656px]" },
  { top: "72.1%", left: "44.3%", size: "text-[6.656px]" },
  { top: "26.2%", left: "39.2%", size: "text-[6.656px]" },
  { top: "58.4%", left: "73.5%", size: "text-[10.205px]" },
  { top: "60.0%", left: "25.6%", size: "text-[6.656px]" },
  { top: "21.4%", left: "61.8%", size: "text-[6.656px]" },
  { top: "79.4%", left: "58.7%", size: "text-[6.656px]" },
  { top: "32.4%", left: "23.8%", size: "text-[6.656px]" },
  { top: "41.6%", left: "80.8%", size: "text-[6.656px]" },
  { top: "78.2%", left: "31.2%", size: "text-[6.656px]" },
  { top: "12.3%", left: "45.7%", size: "text-[6.656px]" },
  { top: "73.6%", left: "76.6%", size: "text-[11.339px]" },
  { top: "50.6%", left: "14.2%", size: "text-[6.656px]" },
  { top: "20.5%", left: "76.1%", size: "text-[6.656px]" },
  { top: "90.4%", left: "48.3%", size: "text-[6.656px]" },
  { top: "16.4%", left: "25.1%", size: "text-[6.656px]" },
  { top: "54.8%", left: "84.0%", size: "text-[6.656px]" },
  { top: "74.4%", left: "16.6%", size: "text-[6.656px]" },
  { top: "4.6%", left: "59.1%", size: "text-[6.656px]" },
];
