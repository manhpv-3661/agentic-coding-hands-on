export interface CommunityStandardsLinkProps {
  label: string;
}

/**
 * "Tiêu chuẩn cộng đồng" (F007, FR-10) — a static, non-navigating stub. No
 * community-standards page exists in this mock project, so this mirrors the
 * exact "Xem chi tiết"/Profile stub precedent already established in F006
 * (`kudos-card.tsx`, `account-menu-button.tsx`): styled as a link, but a
 * `<button>` with no handler, not an `<a href>`.
 */
export function CommunityStandardsLink({ label }: CommunityStandardsLinkProps) {
  return (
    <button
      type="button"
      className="text-sm font-medium text-[#FFEA9E] underline-offset-2 hover:underline"
    >
      {label}
    </button>
  );
}
