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
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-[#2E3940] bg-[#101317] p-6">
      <h3 className="font-montserrat text-sm font-bold tracking-[0.5px] text-white">{heading}</h3>

      {recipients.length === 0 ? (
        <p className="text-sm text-white/60">{emptyLabel}</p>
      ) : (
        <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto">
          {recipients.map((recipient, index) => (
            <li key={index} className="flex items-center gap-3">
              <Avatar name={recipient.name} size={32} />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#FFEA9E]">{recipient.name}</span>
                <span className="text-xs text-white/70">{recipient.gift}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
