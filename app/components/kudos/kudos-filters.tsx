import type { KudosFilterState } from "@/lib/kudos/kudos-types";

export interface KudosFiltersLabels {
  hashtagLabel: string;
  departmentLabel: string;
  allOption: string;
}

export interface KudosFiltersProps {
  value: KudosFilterState;
  onChange: (next: KudosFilterState) => void;
  hashtagOptions: string[];
  departmentOptions: string[];
  labels: KudosFiltersLabels;
}

const ALL_VALUE = "__all__";

/** 24x24 chevron-down glyph embedded in each filter pill (mm:
 * `I2940:13459;186:2761`, "MM_MEDIA_Down"). Overlaid on top of the native
 * `<select>` — a native control can't host an inline icon — while
 * `appearance-none` on the select strips the browser's own arrow, so this
 * is the only dropdown affordance rendered. */
function ChevronDownIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-white"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Shared pill chrome (mm: "Frame 483" INSTANCE `186:2757`) — 1px
 * `#998C5F` border, translucent gold fill, 4px radius, uniform 16px
 * padding (widened on the right for the embedded chevron). Ground truth
 * (`get_frame_image` MaZUn5xHXZ) shows the field's own name ("Hashtag" /
 * "Phòng ban") as the resting/default display text — NOT the generic
 * "Tất cả" — so the un-filtered option renders the field label; picking it
 * from the open dropdown is how the filter resets to "no filter" (same
 * `ALL_VALUE` semantics, just correct display text). */
const PILL_SELECT_CLASSNAME =
  "font-montserrat w-full appearance-none rounded-[4px] border border-[#998C5F] bg-[rgba(255,234,158,0.10)] py-4 pl-4 pr-12 text-base font-bold tracking-[0.15px] text-white";

/**
 * Two independent dropdowns (Hashtag, Phòng ban — FR-5/15). Purely
 * presentational: controlled by `value`/`onChange` props supplied by
 * `kudos-board.tsx` (Phase 08), which is the SINGLE owner of filter state
 * (plan.md client/server boundary decision — no context, prop-drilling to
 * 2 consumers is KISS/YAGNI).
 */
export function KudosFilters({
  value,
  onChange,
  hashtagOptions,
  departmentOptions,
  labels,
}: KudosFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <select
          aria-label={labels.hashtagLabel}
          value={value.hashtag ?? ALL_VALUE}
          onChange={(event) =>
            onChange({
              ...value,
              hashtag: event.target.value === ALL_VALUE ? null : event.target.value,
            })
          }
          className={PILL_SELECT_CLASSNAME}
        >
          <option value={ALL_VALUE}>{labels.hashtagLabel}</option>
          {hashtagOptions.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <ChevronDownIcon />
      </div>

      <div className="relative">
        <select
          aria-label={labels.departmentLabel}
          value={value.department ?? ALL_VALUE}
          onChange={(event) =>
            onChange({
              ...value,
              department: event.target.value === ALL_VALUE ? null : event.target.value,
            })
          }
          className={PILL_SELECT_CLASSNAME}
        >
          <option value={ALL_VALUE}>{labels.departmentLabel}</option>
          {departmentOptions.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
        <ChevronDownIcon />
      </div>
    </div>
  );
}
