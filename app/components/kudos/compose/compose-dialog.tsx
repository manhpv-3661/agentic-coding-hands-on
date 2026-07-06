"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { KudosPerson, KudosPost } from "@/lib/kudos/kudos-types";
import { AnonymousToggle } from "./anonymous-toggle";
import {
  buildKudosPost,
  EMPTY_COMPOSE_FORM_STATE,
  validateComposeForm,
  type ComposeFormErrors,
  type ComposeFormState,
} from "./compose-form-helpers";
import { FieldGroup } from "./field-group";
import { HashtagInput } from "./hashtag-input";
import { ImageUpload } from "./image-upload";
import { RecipientSelect } from "./recipient-select";
import { RichTextEditor } from "./rich-text-editor";

export interface ComposeDialogProps {
  open: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  /** Wrapper's `addPost` (Phase 10) — prepends to the session-scoped feed. */
  onSubmit: (post: KudosPost) => void;
  recipientOptions: KudosPerson[];
  mentionNames: string[];
  currentUser: KudosPerson;
  labels: Dictionary["kudos"]["compose"];
}

const TOAST_DURATION_MS = 2000;

/**
 * "Viết Kudos" dialog shell (F007, FR-1..21) — owns all field state,
 * validation, and submit orchestration; every field component underneath
 * stays controlled/presentational. Escape + outside-click close are
 * provided by the Phase 10 wrapper's `useDismissableMenu` (`containerRef`
 * wraps this panel) — not reimplemented here.
 *
 * The success toast mirrors `copy-link-button.tsx`'s local
 * `useState`+`setTimeout` pattern (no global toast system, YAGNI) and is
 * rendered independent of `open` so it stays visible for
 * `TOAST_DURATION_MS` even after the dialog itself has closed.
 */
export function ComposeDialog({
  open,
  containerRef,
  onClose,
  onSubmit,
  recipientOptions,
  mentionNames,
  currentUser,
  labels,
}: ComposeDialogProps) {
  const [state, setState] = useState<ComposeFormState>(EMPTY_COMPOSE_FORM_STATE);
  const [errors, setErrors] = useState<ComposeFormErrors>({});
  const [toast, setToast] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Discards the draft on EVERY close path (Cancel, Escape, outside-click,
  // successful submit) — `ComposeDialog` never unmounts (only its inner
  // JSX toggles on `open`), so without this the previous draft would
  // silently reappear the next time the dialog opens. Adjusted during
  // render (React's documented pattern for "reset state when a value
  // changes") rather than in an effect, avoiding an extra render pass.
  const [trackedOpen, setTrackedOpen] = useState(open);
  if (open !== trackedOpen) {
    setTrackedOpen(open);
    if (!open) {
      setState(EMPTY_COMPOSE_FORM_STATE);
      setErrors({});
    }
  }

  // Minimal focus management for the "modal": move focus into the panel on
  // open, return it to whatever triggered the dialog (the "Ghi nhận" pill)
  // on close.
  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      containerRef.current?.focus();
    } else {
      previouslyFocusedRef.current?.focus();
      previouslyFocusedRef.current = null;
    }
  }, [open, containerRef]);

  function updateState(patch: Partial<ComposeFormState>, errorKeys: (keyof ComposeFormErrors)[] = []) {
    setState((s) => ({ ...s, ...patch }));
    if (errorKeys.length === 0) return;
    setErrors((currentErrors) => {
      if (errorKeys.every((key) => !(key in currentErrors))) return currentErrors;
      const nextErrors = { ...currentErrors };
      errorKeys.forEach((key) => delete nextErrors[key]);
      return nextErrors;
    });
  }

  function handlePanelKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const panel = containerRef.current;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleSubmit() {
    const validationErrors = validateComposeForm(state, {
      recipient: labels.recipient.error,
      title: labels.title.error,
      content: labels.content.error,
      hashtags: labels.hashtags.error,
      nickname: labels.anonymous.error,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(buildKudosPost(state, currentUser, new Date()));
    onClose();

    setToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(false), TOAST_DURATION_MS);
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label={labels.dialogTitle}
            tabIndex={-1}
            onKeyDown={handlePanelKeyDown}
            className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-5 overflow-y-auto rounded-2xl bg-[#101317] p-6 text-white outline-none"
          >
            <h2 className="font-montserrat text-lg font-bold text-[#FFEA9E]">{labels.dialogTitle}</h2>

            {/* No `htmlFor` here: `RecipientSelect`'s trigger is a
             * `<button>` whose own text IS its accessible name (the
             * placeholder or the selected person) — a programmatically
             * associated `<label>` would override that with the static
             * field label, hiding the current selection from AT users. */}
            <FieldGroup label={labels.recipient.label}>
              <RecipientSelect
                id="compose-recipient"
                options={recipientOptions}
                value={state.recipient}
                onChange={(recipient) => updateState({ recipient }, ["recipient"])}
                error={errors.recipient}
                labels={labels.recipient}
              />
            </FieldGroup>

            <FieldGroup label={labels.title.label} helper={labels.title.helper} htmlFor="compose-title">
              <input
                id="compose-title"
                type="text"
                value={state.title}
                onChange={(event) => updateState({ title: event.target.value }, ["title"])}
                placeholder={labels.title.placeholder}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "compose-title-error" : undefined}
                className="w-full rounded-lg border border-white/20 bg-[#101317] px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
              />
              {errors.title && (
                <p id="compose-title-error" className="text-xs text-red-400">
                  {errors.title}
                </p>
              )}
            </FieldGroup>

            <RichTextEditor
              value={state.content}
              onChange={(content) => updateState({ content }, ["content"])}
              mentionNames={mentionNames}
              error={errors.content}
              labels={labels.content}
            />

            <FieldGroup label={labels.hashtags.label} htmlFor="compose-hashtags">
              <HashtagInput
                id="compose-hashtags"
                value={state.hashtags}
                onChange={(hashtags) => updateState({ hashtags }, ["hashtags"])}
                error={errors.hashtags}
                labels={labels.hashtags}
              />
            </FieldGroup>

            <FieldGroup label={labels.images.label} htmlFor="compose-images">
              <ImageUpload
                id="compose-images"
                value={state.images}
                onChange={(images) => updateState({ images })}
                labels={labels.images}
              />
            </FieldGroup>

            <AnonymousToggle
              checked={state.anonymous}
              onCheckedChange={(anonymous) => updateState({ anonymous })}
              nickname={state.nickname}
              onNicknameChange={(nickname) => updateState({ nickname }, ["nickname"])}
              nicknameError={errors.nickname}
              labels={labels.anonymous}
            />

            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-[#FFEA9E] px-4 py-2 text-sm font-bold text-[#00101A] hover:opacity-90"
              >
                {labels.submit}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <span
          role="status"
          className="fixed bottom-6 left-1/2 z-60 -translate-x-1/2 rounded bg-[#00101A] px-3 py-2 text-xs text-white shadow"
        >
          {labels.successToast}
        </span>
      )}
    </>
  );
}
