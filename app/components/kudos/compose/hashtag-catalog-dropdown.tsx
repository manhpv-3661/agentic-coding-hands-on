"use client";

import { useDismissableMenu } from "@/hooks/use-dismissable-menu";
import {
  KUDOS_HASHTAG_CATALOG,
  KUDOS_HASHTAG_GROUPS,
} from "@/lib/kudos/kudos-hashtag-catalog";
import { ChevronDownIcon } from "./chevron-down-icon";

export interface HashtagCatalogDropdownGroupLabels {
  cultureValues: string;
  performance: string;
  teamwork: string;
}

export interface HashtagCatalogDropdownLabels {
  /** Trigger caption, e.g. "Add from list". */
  browse: string;
  /** Caption for the group preset `<select>`, doubles as its placeholder. */
  group: string;
  groups: HashtagCatalogDropdownGroupLabels;
}

export interface HashtagCatalogDropdownProps {
  value: string[];
  /** Whether the chip cap is already reached — disables un-selected rows. */
  atMax: boolean;
  /** Toggles one catalog tag on/off; parent owns the dedupe + cap rule. */
  onToggleTag: (tag: string) => void;
  /** Bulk-applies a group's tags; parent owns the dedupe + cap rule. */
  onApplyGroup: (tags: string[]) => void;
  /** Partial on purpose: `HashtagInputLabels.browse/group/groups` are
   * optional (pre-Phase-04 callers/tests omit them) — missing fields fall
   * back to `DEFAULT_LABELS` below rather than pushing that default-merge
   * onto every caller of this component. */
  labels: Partial<HashtagCatalogDropdownLabels>;
}

const DEFAULT_LABELS: HashtagCatalogDropdownLabels = {
  browse: "Add from list",
  group: "Choose a group",
  groups: { cultureValues: "Culture & values", performance: "Performance", teamwork: "Teamwork" },
};

function isSelected(value: string[], tag: string): boolean {
  return value.some((existing) => existing.toLowerCase() === tag.toLowerCase());
}

/**
 * Additive catalog dropdown + group preset selector for `HashtagInput`
 * (Phase 04, see `lib/kudos/kudos-hashtag-catalog.ts` for the "INVENTED
 * placeholder content" disclosure). Purely presentational: both the
 * checklist rows and the group `<select>` funnel back into the parent's
 * `onToggleTag`/`onApplyGroup` callbacks, which apply the exact same
 * dedupe + max-cap rule the free-text path uses — this component owns no
 * tag-mutation logic of its own.
 *
 * Reuses `useDismissableMenu` (same primitive as `recipient-select.tsx`)
 * for outside-click/Escape close instead of reimplementing it.
 */
export function HashtagCatalogDropdown({
  value,
  atMax,
  onToggleTag,
  onApplyGroup,
  labels: labelsProp,
}: HashtagCatalogDropdownProps) {
  const { open, containerRef, triggerProps } = useDismissableMenu({ haspopup: "listbox" });
  const labels: HashtagCatalogDropdownLabels = {
    browse: labelsProp.browse ?? DEFAULT_LABELS.browse,
    group: labelsProp.group ?? DEFAULT_LABELS.group,
    groups: labelsProp.groups ?? DEFAULT_LABELS.groups,
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        {...triggerProps}
        className="inline-flex h-12 items-center gap-1 rounded-lg border border-[#998C5F] bg-white px-3 text-xs font-semibold text-[#00101A]"
      >
        {labels.browse}
        <span aria-hidden="true" className="text-[#998C5F]">
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 z-10 mt-1 w-64 rounded-lg border border-[#998C5F] bg-white p-2 shadow-lg">
          <label className="mb-2 flex flex-col gap-1 text-xs font-semibold text-[#999]">
            {labels.group}
            <select
              value=""
              onChange={(event) => {
                const group = KUDOS_HASHTAG_GROUPS.find((g) => g.id === event.target.value);
                if (group) onApplyGroup(group.tags);
                event.currentTarget.value = "";
              }}
              className="rounded-md border border-[#998C5F] bg-white px-2 py-1.5 text-sm text-[#00101A] outline-none"
            >
              <option value="" disabled>
                {labels.group}
              </option>
              {KUDOS_HASHTAG_GROUPS.map((group) => (
                <option key={group.id} value={group.id}>
                  {labels.groups[group.id]}
                </option>
              ))}
            </select>
          </label>

          <ul role="listbox" className="flex max-h-48 flex-col gap-1 overflow-y-auto">
            {KUDOS_HASHTAG_CATALOG.map((tag) => {
              const selected = isSelected(value, tag);
              const disableRow = atMax && !selected;
              return (
                <li key={tag}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={disableRow}
                    onClick={() => onToggleTag(tag)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-[#00101A] hover:bg-[#FFF8E1] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    <span>{tag}</span>
                    {selected && <span aria-hidden="true">✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
