"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { KUDOS_IMAGES_MAX_COUNT } from "@/lib/kudos/kudos-compose-limits";
import { ChipAddTrigger } from "./chip-add-trigger";

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
  /** Cap on the number of images (default `KUDOS_IMAGES_MAX_COUNT`, F007
   * FR-14/15 — same constant the server re-checks in `createKudosAction`,
   * review finding H1). */
  max?: number;
  labels: ImageUploadLabels;
  /** Id applied to the hidden file input, so a wrapping `FieldGroup` label
   * can point `htmlFor` at it (clicking the label opens the file picker). */
  id?: string;
}

/** Real client-side file selection + preview for up to 5 images. */
export function ImageUpload({
  value,
  onChange,
  max = KUDOS_IMAGES_MAX_COUNT,
  labels,
  id,
}: ImageUploadProps) {
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
    const current = value.slice(0, max);
    const remainingCapacity = max - current.length;
    setTruncated(selected.length > remainingCapacity);
    if (remainingCapacity > 0 && selected.length > 0) {
      onChange([...current, ...selected.slice(0, remainingCapacity)].slice(0, max));
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
        // Explicit `aria-label`: the trigger's visible text is now the
        // ground-truth two-line "Image / Tối đa 5" caption, but the
        // accessible name should stay the concise "+Image" action label
        // (same pattern `hashtag-input.tsx`'s closed trigger already uses).
        <ChipAddTrigger
          ariaLabel={labels.add}
          onClick={() => inputRef.current?.click()}
          label={labels.label}
          max={labels.max}
        />
      )}

      <input
        id={id}
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={max > 1}
        onChange={handleFilesSelected}
        className="hidden"
      />

      {truncated && <p className="w-full text-xs font-semibold text-amber-700">{labels.truncated}</p>}
    </div>
  );
}
