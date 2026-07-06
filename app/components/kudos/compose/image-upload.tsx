"use client";

import { useEffect, useMemo, useRef } from "react";

export interface ImageUploadLabels {
  add: string;
  max: string;
  remove: string;
}

export interface ImageUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  /** Cap on the number of images (default 5, F007 FR-14/15). */
  max?: number;
  labels: ImageUploadLabels;
}

/**
 * Real client-side file selection + preview (F007, FR-14..16). No
 * storage/upload backend exists in this repo (clarifications.md) — only
 * the resulting file COUNT is ever persisted by the caller onto a
 * `KudosPost` (`imageCount`); previews are ephemeral `URL.createObjectURL`
 * blobs revoked on remove/unmount so they never leak.
 */
export function ImageUpload({ value, onChange, max = 5, labels }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const atMax = value.length >= max;

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
    if (remainingCapacity > 0 && selected.length > 0) {
      onChange([...value, ...selected.slice(0, remainingCapacity)]);
    }
    event.target.value = "";
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {value.map((file, index) => (
        <span key={`${file.name}-${index}`} className="relative inline-block">
          {previewUrls[index] && (
            // eslint-disable-next-line @next/next/no-img-element -- ephemeral local blob preview, not a remote/static asset
            <img
              src={previewUrls[index]}
              alt={file.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
          )}
          <button
            type="button"
            aria-label={labels.remove}
            onClick={() => removeAt(index)}
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
          >
            ×
          </button>
        </span>
      ))}

      {atMax ? (
        <span className="text-xs text-white/40">{labels.max}</span>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border border-dashed border-white/30 text-xs font-semibold text-[#FFEA9E]"
        >
          {labels.add}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
      />
    </div>
  );
}
