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
      <label className="flex items-center gap-2 text-sm text-white/70">
        {labels.hashtagLabel}
        <select
          value={value.hashtag ?? ALL_VALUE}
          onChange={(event) =>
            onChange({
              ...value,
              hashtag: event.target.value === ALL_VALUE ? null : event.target.value,
            })
          }
          className="rounded-md border border-white/20 bg-[#101317] px-3 py-2 text-white"
        >
          <option value={ALL_VALUE}>{labels.allOption}</option>
          {hashtagOptions.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-white/70">
        {labels.departmentLabel}
        <select
          value={value.department ?? ALL_VALUE}
          onChange={(event) =>
            onChange({
              ...value,
              department: event.target.value === ALL_VALUE ? null : event.target.value,
            })
          }
          className="rounded-md border border-white/20 bg-[#101317] px-3 py-2 text-white"
        >
          <option value={ALL_VALUE}>{labels.allOption}</option>
          {departmentOptions.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
