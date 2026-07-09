import type { GiftRecipient, KudosStats } from "@/lib/kudos/kudos-types";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { KudosStatsBox } from "./kudos-stats-box";
import { RecentGiftRecipients } from "./recent-gift-recipients";

export interface KudosSidebarProps {
  stats: KudosStats;
  recipients: GiftRecipient[];
  labels: Dictionary["kudos"];
}

/**
 * Composes the stats box + top-10 recipients into the "ALL KUDOS" sidebar
 * column. Server-rendered by `page.tsx` and passed to `kudos-board.tsx`
 * (Phase 08) as the `sidebar` slot prop — it must stay OUT of the client
 * component tree so it never enters the client bundle (the one exception,
 * `OpenGiftButton`, is its own small client leaf).
 */
export function KudosSidebar({ stats, recipients, labels }: KudosSidebarProps) {
  return (
    // mm:2940:13488 ("D_Thống menu phải") — 422px sidebar column, not 360px.
    <div className="flex w-[422px] shrink-0 flex-col gap-6">
      <KudosStatsBox stats={stats} statsLabels={labels.stats} giftLabels={labels.gift} />
      <RecentGiftRecipients
        heading={labels.recent.heading}
        recipients={recipients}
        emptyLabel={labels.empty.recipients}
      />
    </div>
  );
}
