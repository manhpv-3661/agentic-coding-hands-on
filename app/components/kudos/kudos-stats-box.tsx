import type { KudosStats } from "@/lib/kudos/kudos-types";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { HeartIcon } from "./kudos-card-icons";
import { OpenGiftButton } from "./open-gift-button";
import { SidebarPanel } from "./sidebar-panel";

export interface KudosStatsBoxProps {
  stats: KudosStats;
  statsLabels: Dictionary["kudos"]["stats"];
  giftLabels: Dictionary["kudos"]["gift"];
}

/** Marks which stat row carries the "x2" heart-multiplier badge
 * (`stats.hearts` — "Số tim" — per MoMorph ground truth §2 sidebar). */
const HEARTS_ROW_KEY = "hearts";

/**
 * Stats sidebar box (FR-18): received / sent / hearts /
 * secretBoxOpened / secretBoxUnopened.
 *
 * In configured mode the numbers are real per-current-user aggregates from
 * `lib/kudos/kudos-aggregates-repository.ts`; in fallback mode they come
 * from the static mock constants. The component itself stays purely
 * presentational except for the one client leaf, `OpenGiftButton`.
 */
export function KudosStatsBox({ stats, statsLabels, giftLabels }: KudosStatsBoxProps) {
  const rows: Array<{ key: string; label: string; value: number }> = [
    { key: "received", label: statsLabels.received, value: stats.received },
    { key: "sent", label: statsLabels.sent, value: stats.sent },
    { key: HEARTS_ROW_KEY, label: statsLabels.hearts, value: stats.hearts },
    { key: "secretBoxOpened", label: statsLabels.secretBoxOpened, value: stats.secretBoxOpened },
    {
      key: "secretBoxUnopened",
      label: statsLabels.secretBoxUnopened,
      value: stats.secretBoxUnopened,
    },
  ];

  return (
    <SidebarPanel className="p-6">
      {/* Row/divider/button spacing: MoMorph `Nội dung` (2940:13490) is a
       * flex column with a uniform 16px gap across ALL its children
       * (rows + divider), not the 12px `gap-3` this used to carry. */}
      <dl className="flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row.key}>
            {/* Divider between the "tim" row and the secret-box rows. */}
            {row.key === "secretBoxOpened" && <div className="mb-4 h-px w-full bg-[#2E3940]" />}
            <div className="flex items-center justify-between gap-4">
              <dt className="font-montserrat flex-1 text-right text-[22px] leading-7 font-bold text-white">
                {row.label}
              </dt>
              <div className="flex items-center gap-2">
                {row.key === HEARTS_ROW_KEY && (
                  <span
                    aria-hidden="true"
                    className="relative flex h-10 w-[34px] shrink-0 items-center justify-center text-[#D4271D]"
                  >
                    <HeartIcon filled className="h-full w-full" />
                    <span
                      className="font-montserrat absolute inset-0 flex items-center justify-center text-[17.5px] font-bold text-white"
                      style={{ WebkitTextStroke: "1.04px #000" }}
                    >
                      x2
                    </span>
                  </span>
                )}
                <dd className="font-montserrat text-[32px] leading-10 font-bold text-[#FFEA9E]">
                  {row.value}
                </dd>
              </div>
            </div>
          </div>
        ))}
      </dl>
      <OpenGiftButton labels={giftLabels} unopenedCount={stats.secretBoxUnopened} />
    </SidebarPanel>
  );
}
