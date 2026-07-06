import type { KudosStats } from "@/lib/kudos/kudos-types";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { OpenGiftButton } from "./open-gift-button";

export interface KudosStatsBoxProps {
  stats: KudosStats;
  statsLabels: Dictionary["kudos"]["stats"];
  giftLabels: Dictionary["kudos"]["gift"];
}

/**
 * Static stats sidebar box (FR-18): received / sent / hearts /
 * secretBoxOpened / secretBoxUnopened — all mock figures, no real
 * points/reward computation exists in this project. Renders 5 rows
 * (the reviewed screenshot ground truth; FR-18's spec text lists 4 —
 * `KudosStats` simply carries whichever fields exist, so both counts are
 * satisfied by the same data-driven row list, see plan.md open item).
 *
 * Presentational except for the one client leaf, `OpenGiftButton`.
 */
export function KudosStatsBox({ stats, statsLabels, giftLabels }: KudosStatsBoxProps) {
  const rows: Array<{ label: string; value: number }> = [
    { label: statsLabels.received, value: stats.received },
    { label: statsLabels.sent, value: stats.sent },
    { label: statsLabels.hearts, value: stats.hearts },
    { label: statsLabels.secretBoxOpened, value: stats.secretBoxOpened },
    { label: statsLabels.secretBoxUnopened, value: stats.secretBoxUnopened },
  ];

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-[#2E3940] bg-[#101317] p-6">
      <dl className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <dt className="text-sm text-white/70">{row.label}</dt>
            <dd className="text-sm font-semibold text-white">{row.value}</dd>
          </div>
        ))}
      </dl>
      <OpenGiftButton labels={giftLabels} />
    </div>
  );
}
