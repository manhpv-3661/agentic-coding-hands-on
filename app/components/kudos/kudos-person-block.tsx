import { personBadge } from "@/lib/kudos/kudos-data";
import type { KudosPerson } from "@/lib/kudos/kudos-types";
import { Avatar } from "./avatar";

export interface KudosPersonBlockProps {
  person: KudosPerson;
}

/**
 * Sender/recipient header block for `KudosCard` — 64px initials avatar
 * with a white border (locked decision: initials-in-circle, no photos) +
 * dark name + gray department/star line + an optional "danh hiệu" badge
 * chip (design node `3106:17694`) when the mock person carries one
 * (`personBadge`, `kudos-data.ts`). Extracted from `kudos-card.tsx` to
 * keep it under the 200-line budget.
 */
export function KudosPersonBlock({ person }: KudosPersonBlockProps) {
  const badge = personBadge(person);

  return (
    <div className="flex items-center gap-3">
      <Avatar name={person.name} size={64} className="border-[1.869px] border-white" />
      <div className="flex flex-col items-start gap-1">
        <span className="font-montserrat text-base leading-6 font-bold tracking-[0.15px] text-[#00101A]">
          {person.name}
        </span>
        {/* Anonymous senders (F007, FR-18) have no department/stars. */}
        {person.department && (
          <span className="font-montserrat text-sm leading-5 font-bold text-[#999999]">
            {person.department} · ⭐ {person.stars}
          </span>
        )}
        {badge && (
          <span className="rounded-full border-[0.5px] border-[#FFEA9E] bg-[rgba(9,36,50,0.5)] px-2 py-0.5 text-[11.4px] font-bold text-white">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
