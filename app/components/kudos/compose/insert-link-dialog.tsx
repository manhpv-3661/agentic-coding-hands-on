"use client";

import { useState } from "react";
import { FieldError } from "./field-error";

export interface InsertLinkDialogLabels {
  title: string;
  contentLabel: string;
  urlLabel: string;
  save: string;
  cancel: string;
  urlError: string;
}

export interface InsertLinkDialogProps {
  open: boolean;
  onCancel: () => void;
  /** `content` is carried through for symmetry with the design's two
   * fields, but is otherwise decorative — see the component doc comment. */
  onSave: (url: string, content: string) => void;
  labels: InsertLinkDialogLabels;
}

const FIELD_CLASS =
  "w-full rounded-lg border border-[#998C5F] bg-white px-3 py-2 text-sm text-[#00101A] outline-none";

/**
 * Cream 2-field "Thêm đường dẫn" mini-dialog (F007, FR-24) — replaces the
 * toolbar link button's `window.prompt()`. "URL" is required; a blank Save
 * shows an inline error and keeps the dialog open (edge-case row 4).
 * "Nội dung" is optional/decorative: `rich-text-editor.tsx`'s `exec` only
 * runs `document.execCommand("createLink", url)`, which wraps the current
 * selection — it can't cheaply set custom display text, so per FR-24's own
 * guidance this field is local state only and is not wired into the editor.
 */
export function InsertLinkDialog({ open, onCancel, onSave, labels }: InsertLinkDialogProps) {
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState(false);

  // Reset the draft every time the dialog transitions to open (render-phase
  // reset, same pattern as `compose-dialog.tsx`'s discard-on-close).
  const [trackedOpen, setTrackedOpen] = useState(open);
  if (open !== trackedOpen) {
    setTrackedOpen(open);
    if (open) {
      setContent("");
      setUrl("");
      setError(false);
    }
  }

  if (!open) return null;

  function handleSave() {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError(true);
      return;
    }
    onSave(trimmedUrl, content);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={labels.title}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-[#FFF8E1] p-6 text-[#00101A]"
      >
        <h2 className="text-center text-lg font-bold text-[#00101A]">{labels.title}</h2>

        <label className="flex flex-col gap-1 text-sm">
          {labels.contentLabel}
          <input
            type="text"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className={FIELD_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {labels.urlLabel}
          <input
            type="text"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              if (error) setError(false);
            }}
            aria-invalid={error}
            aria-describedby={error ? "insert-link-url-error" : undefined}
            className={FIELD_CLASS}
          />
        </label>
        {error && <FieldError id="insert-link-url-error">{labels.urlError}</FieldError>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#998C5F] bg-[#FFEA9E]/10 px-4 py-2 text-sm font-semibold text-[#00101A] hover:bg-[#FFEA9E]/20"
          >
            {labels.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-[#FFEA9E] px-4 py-2 text-sm font-bold text-[#00101A] hover:opacity-90"
          >
            {labels.save}
          </button>
        </div>
      </div>
    </div>
  );
}
