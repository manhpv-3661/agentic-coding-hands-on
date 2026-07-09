"use client";

import { useEffect, useRef, useState } from "react";
import { KUDOS_HASHTAGS_MAX_COUNT } from "@/lib/kudos/kudos-compose-limits";
import { addTag, addTags, isDuplicateTag } from "@/lib/kudos/kudos-hashtag-merge";
import { HashtagCatalogDropdown, type HashtagCatalogDropdownGroupLabels } from "./hashtag-catalog-dropdown";

export interface HashtagInputLabels {
  /** Field caption, also the closed trigger's first text line (ground truth
   * node I520:11647;662:8911;186:2760: "Hashtag\nTối đa 5" — same value as
   * `compose.hashtags.label` passed to the wrapping `FieldGroup`). */
  label: string;
  placeholder: string;
  add: string;
  max: string;
  error: string;
  remove: string;
  /** Catalog/group-preset captions (Phase 04, additive; optional+defaulted). */
  browse?: string;
  group?: string;
  groups?: HashtagCatalogDropdownGroupLabels;
}

export interface HashtagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  /** Cap on the number of chips (default `KUDOS_HASHTAGS_MAX_COUNT`, F007
   * FR-11/12 — same constant the server re-checks in `createKudosAction`,
   * review finding H1). */
  max?: number;
  error?: string;
  labels: HashtagInputLabels;
  /** Id applied to the "add new tag" trigger/input, so a wrapping
   * `FieldGroup` label can point `htmlFor` at it. */
  id?: string;
}

/** Ground-truth `MM_MEDIA_Plus` icon (24x24, screen ihQ26W78P2 node
 * I520:11647;662:8911's child, componentId 490:5726) — mirrors the same
 * icon already inlined in `image-upload.tsx`'s identical "+Ảnh" trigger
 * (both share componentId 186:2757). */
function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Controlled hashtag chip input (F007, FR-11..13). No tag-input library
 * exists in this repo (clarifications.md) — mirrors `kudos-filters.tsx`'s
 * plain controlled-input style. Auto-prefixes `#`, dedupes
 * case-insensitively, and caps at `max` chips.
 *
 * At rest the field shows only a closed "+Hashtag" pill trigger (ground
 * truth componentId 186:2757, the same closed button `image-upload.tsx`
 * uses for "+Ảnh") — the text-entry row is revealed only once the user
 * clicks it (FR-22 restyle).
 *
 * Phase 04 additively wires in `HashtagCatalogDropdown` (predefined-tag
 * checklist + group presets, INVENTED content, see
 * `lib/kudos/kudos-hashtag-catalog.ts`), via `toggleCatalogTag`/`applyGroup`
 * below reusing `addTag`/`addTags` — same rule as `commit()`. */
export function HashtagInput({
  value,
  onChange,
  max = KUDOS_HASHTAGS_MAX_COUNT,
  error,
  labels,
  id,
}: HashtagInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const atMax = value.length >= max;
  const errorId = id ? `${id}-error` : undefined;

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  function commit() {
    if (!text.trim()) return;
    const next = addTag(value, text, max);
    if (next !== value) onChange(next);
    setText("");
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  /** Dropdown row click: remove if selected, else add (no-op at max). */
  function toggleCatalogTag(tag: string) {
    if (isDuplicateTag(value, tag)) {
      onChange(value.filter((existing) => existing.toLowerCase() !== tag.toLowerCase()));
      return;
    }
    const next = addTag(value, tag, max);
    if (next !== value) onChange(next);
  }

  /** Group preset: bulk-add, silently dropping overflow past `max`. */
  function applyGroup(tags: string[]) {
    const next = addTags(value, tags, max);
    if (next !== value) onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {value.map((tag, index) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-lg border border-[#998C5F] bg-white px-3 py-1 text-xs text-[#00101A]"
          >
            {tag}
            <button
              type="button"
              aria-label={labels.remove}
              onClick={() => removeAt(index)}
              className="text-[#998C5F] hover:text-[#00101A]"
            >
              ×
            </button>
          </span>
        ))}

        {atMax ? (
          <span className="rounded-lg border border-[#998C5F]/50 px-3 py-1 text-xs text-[#999]">
            {labels.max}
          </span>
        ) : isOpen ? (
          <span className="flex h-12 items-center gap-1.5 rounded-lg border border-[#998C5F] bg-white px-2 py-1">
            <input
              id={id}
              ref={inputRef}
              type="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commit();
                }
              }}
              placeholder={labels.placeholder}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              className="w-28 bg-transparent text-xs text-[#00101A] outline-none placeholder:text-[#999]"
            />
            <button type="button" onClick={commit} className="text-xs font-semibold text-[#00101A]">
              {labels.add}
            </button>
          </span>
        ) : (
          <button
            id={id}
            type="button"
            // Explicit `aria-label` because `id` also carries the
            // `FieldGroup` label's `htmlFor` association — without it, the
            // native label/control pairing would override this button's own
            // "+Hashtag" text with the field label's "Hashtag" text as the
            // accessible name (same reasoning `image-upload.tsx` sidesteps
            // by putting `id` on its hidden file input instead).
            aria-label={labels.add}
            onClick={() => setIsOpen(true)}
            className="inline-flex h-12 items-center gap-1 rounded-lg border border-[#998C5F] bg-white px-2 py-1"
          >
            <PlusIcon />
            {/* Ground truth's trigger caption is one two-line TEXT node
             * ("Hashtag\nTối đa 5") rather than a "+Hashtag" single line —
             * the word and the max-count hint are always shown together. */}
            <span className="flex flex-col text-left text-[11px] leading-4 font-bold tracking-[0.5px] text-[#999]">
              <span>{labels.label}</span>
              <span>{labels.max}</span>
            </span>
          </button>
        )}

        {/* Catalog dropdown + group preset (Phase 04, additive). */}
        <HashtagCatalogDropdown
          value={value}
          atMax={atMax}
          onToggleTag={toggleCatalogTag}
          onApplyGroup={applyGroup}
          labels={labels}
        />
      </div>

      {error && (
        <p id={errorId} className="text-xs font-semibold text-[#CF1322]">
          {error}
        </p>
      )}
    </div>
  );
}
