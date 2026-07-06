"use client";

import { useState } from "react";

export interface HashtagInputLabels {
  placeholder: string;
  add: string;
  max: string;
  error: string;
  remove: string;
}

export interface HashtagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  /** Cap on the number of chips (default 5, F007 FR-11/12). */
  max?: number;
  error?: string;
  labels: HashtagInputLabels;
}

/**
 * Controlled hashtag chip input (F007, FR-11..13). No tag-input library
 * exists in this repo (clarifications.md) — mirrors `kudos-filters.tsx`'s
 * plain controlled-input style. Auto-prefixes `#`, dedupes
 * case-insensitively, and caps at `max` chips.
 */
export function HashtagInput({ value, onChange, max = 5, error, labels }: HashtagInputProps) {
  const [text, setText] = useState("");
  const atMax = value.length >= max;

  function commit() {
    const trimmed = text.trim();
    if (!trimmed || atMax) return;

    const tag = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    const isDuplicate = value.some((existing) => existing.toLowerCase() === tag.toLowerCase());
    if (!isDuplicate) {
      onChange([...value, tag]);
    }
    setText("");
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {value.map((tag, index) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white"
          >
            {tag}
            <button
              type="button"
              aria-label={labels.remove}
              onClick={() => removeAt(index)}
              className="text-white/60 hover:text-white"
            >
              ×
            </button>
          </span>
        ))}

        {atMax ? (
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">
            {labels.max}
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full border border-white/20 px-2 py-1">
            <input
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
              className="w-28 bg-transparent text-xs text-white outline-none placeholder:text-white/40"
            />
            <button type="button" onClick={commit} className="text-xs font-semibold text-[#FFEA9E]">
              {labels.add}
            </button>
          </span>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
