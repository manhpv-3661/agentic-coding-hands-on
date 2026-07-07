import type { GiftRecipient } from "@/lib/kudos/kudos-types";
import { Avatar } from "./avatar";

export interface RecentGiftRecipientsProps {
  heading: string;
  recipients: GiftRecipient[];
  emptyLabel: string;
}

/**
 * "10 SUNNER NHẬN QUÀ MỚI NHẤT" list (FR-20/21). Independently scrollable
 * column (`overflow-y-auto`) so it doesn't force the whole sidebar (or
 * page) to grow with 10 rows. Pure presentational.
 */
export function RecentGiftRecipients({ heading, recipients, emptyLabel }: RecentGiftRecipientsProps) {
  return (
    // MoMorph `D.3_10 SUNNER nhận quà` (2940:13510) padding is asymmetric —
    // "24px 16px 24px 24px" (top/right/bottom/left) — not the uniform `p-6`
    // this used to carry. The list's own `pr-2` below supplies half of that
    // 16px right total (scrollbar-thumb clearance); `pr-2` here supplies
    // the other half so both states (idle/scrolling) land on 16px.
    <div className="flex w-full flex-col gap-4 rounded-[17px] border border-[#998C5F] bg-[#00070C] py-6 pr-2 pl-6">
      {/* The heading is a sibling of the `<ul>` below, not a wrapper around
       * it, so it needs its own matching `pr-2` to reach the same 16px
       * right inset the list gets — otherwise it centers ~4px off from
       * ground truth (Frame 517, `2940:13512`), which applies the 24px
       * left / 16px right box uniformly to both children. */}
      <h3 className="font-montserrat pr-2 text-center text-[22px] leading-7 font-bold text-[#FFEA9E]">
        {heading}
      </h3>

      {recipients.length === 0 ? (
        <p className="text-sm text-white/60">{emptyLabel}</p>
      ) : (
        // Scrollbar hint per MoMorph ground truth: 2px, #999, radius 8px,
        // right edge. Webkit via arbitrary variants + Firefox via inline
        // `scrollbarColor` — no plugin dependency (YAGNI).
        <ul
          className="flex max-h-72 flex-col gap-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-[#999]"
          style={{ scrollbarColor: "#999 transparent", scrollbarWidth: "thin" }}
        >
          {recipients.map((recipient, index) => (
            // mm:2940:13516 — 364px flex-row row (avatar + Frame 520), not a
            // justify-between spread: the gift text is right-aligned only
            // within the 230px stacked column beside the avatar, not the
            // full row width.
            <li key={index} className="flex w-full max-w-[364px] items-center gap-2">
              <Avatar name={recipient.name} size={64} className="shrink-0 border-[1.869px] border-white" />
              <div className="flex w-[230px] flex-col items-start gap-0.5">
                <span className="font-montserrat text-left text-[22px] leading-7 font-bold text-[#FFEA9E]">
                  {recipient.name}
                </span>
                <span className="font-montserrat w-full text-right text-base leading-6 font-bold tracking-[0.15px] text-white">
                  {recipient.gift}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
