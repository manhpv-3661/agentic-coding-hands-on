"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/** Ground-truth `MM_MEDIA_Plus` icon (24x24, screen ihQ26W78P2 node
 * I520:11647;662:9133;186:2760) — inlined since no icon set exists in this
 * repo yet. Decorative only; the button's own text carries the accessible
 * name. */
function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export interface ImageUploadLabels {
  /** Field caption, also the closed trigger's first text line (ground truth
   * node I520:11647;662:9133;186:2760: "Image\nTối đa 5" — same value as
   * `compose.images.label` passed to the wrapping `FieldGroup`). */
  label: string;
  add: string;
  max: string;
  remove: string;
  /** Shown when a selection is silently capped by `max` (F007 FR-14/15). */
  truncated: string;
}

export interface ImageUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  /** Cap on the number of images (default 5, F007 FR-14/15). */
  max?: number;
  labels: ImageUploadLabels;
  /** Id applied to the hidden file input, so a wrapping `FieldGroup` label
   * can point `htmlFor` at it (clicking the label opens the file picker). */
  id?: string;
}

/**
 * Real client-side file selection + preview (F007, FR-14..16). No
 * storage/upload backend exists in this repo (clarifications.md) — only
 * the resulting file COUNT is ever persisted by the caller onto a
 * `KudosPost` (`imageCount`); previews are ephemeral `URL.createObjectURL`
 * blobs revoked on remove/unmount so they never leak.
 */
export function ImageUpload({ value, onChange, max = 5, labels, id }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const atMax = value.length >= max;
  const [truncated, setTruncated] = useState(false);

  // Derived (not stored in state) so creating preview URLs never triggers
  // a second render pass; the cleanup effect below only revokes — it does
  // not call `setState` (avoids react-hooks/set-state-in-effect).
  const previewUrls = useMemo(() => {
    if (typeof URL.createObjectURL !== "function") return [];
    return value.map((file) => URL.createObjectURL(file));
  }, [value]);

  useEffect(() => {
    return () => {
      if (typeof URL.revokeObjectURL === "function") {
        previewUrls.forEach((url) => URL.revokeObjectURL(url));
      }
    };
  }, [previewUrls]);

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    const remainingCapacity = max - value.length;
    setTruncated(selected.length > remainingCapacity);
    if (remainingCapacity > 0 && selected.length > 0) {
      onChange([...value, ...selected.slice(0, remainingCapacity)]);
    }
    event.target.value = "";
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {value.map((file, index) => (
        <span key={`${file.name}-${index}`} className="relative inline-block">
          {previewUrls[index] && (
            // eslint-disable-next-line @next/next/no-img-element -- ephemeral local blob preview, not a remote/static asset
            <img
              src={previewUrls[index]}
              alt={file.name}
              className="h-20 w-20 rounded-sm border border-[#FFEA9E] object-cover"
            />
          )}
          <button
            type="button"
            aria-label={labels.remove}
            onClick={() => removeAt(index)}
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4271D] text-xs text-white"
          >
            ×
          </button>
        </span>
      ))}

      {atMax ? (
        <span className="text-xs text-[#999]">{labels.max}</span>
      ) : (
        <button
          type="button"
          // Explicit `aria-label`: the trigger's visible text is now the
          // ground-truth two-line "Image / Tối đa 5" caption, but the
          // accessible name should stay the concise "+Image" action label
          // (same pattern `hashtag-input.tsx`'s closed trigger already uses).
          aria-label={labels.add}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-12 items-center gap-1 rounded-lg border border-[#998C5F] bg-white px-2 py-1"
        >
          <PlusIcon />
          {/* Ground truth's trigger caption is one two-line TEXT node
           * ("Image\nTối đa 5") rather than a "+Image" single line — the
           * word and the max-count hint are always shown together, not
           * swapped for a separate node once full. */}
          <span className="flex flex-col text-left text-[11px] leading-4 font-bold tracking-[0.5px] text-[#999]">
            <span>{labels.label}</span>
            <span>{labels.max}</span>
          </span>
        </button>
      )}

      <input
        id={id}
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
      />

      {truncated && <p className="w-full text-xs font-semibold text-amber-700">{labels.truncated}</p>}
    </div>
  );
}
