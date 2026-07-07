"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { KudosPerson, KudosPost } from "@/lib/kudos/kudos-types";
import { ComposeDialogFields } from "./compose-dialog-fields";
import {
  buildKudosPost,
  EMPTY_COMPOSE_FORM_STATE,
  validateComposeForm,
  type ComposeFormErrors,
  type ComposeFormState,
} from "./compose-form-helpers";

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

/** Ground-truth `MM_MEDIA_Close` icon (24x24, screen ihQ26W78P2 node
 * I520:11647;520:9906) — decorative only, the Cancel button's own text
 * carries the accessible name. */
function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Ground-truth `MM_MEDIA_Send` icon (24x24, screen ihQ26W78P2 node
 * I520:11647;520:9907) — decorative only, the Submit button's own text
 * carries the accessible name. */
function SendIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12l16-8-6 16-2.5-6.5L4 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * "Viết Kudos" dialog shell (F007, FR-1..21; cream restyle FR-22) — owns
 * field state/validation/submit; `ComposeDialogFields` renders the field
 * stack (split out for the 200-line cap). Escape/outside-click close come
 * from the Phase 10 wrapper's `useDismissableMenu`. The success toast
 * mirrors `copy-link-button.tsx`'s local timeout pattern and renders
 * independent of `open` so it survives the dialog closing.
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
  // Double-submit guard: a ref flips synchronously so a second submit in
  // the same tick (before a disabled-button re-render) bails out early.
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Discards the draft on every close path (never unmounts) — render-phase
  // reset, React's pattern for "reset state when a value changes".
  const [trackedOpen, setTrackedOpen] = useState(open);
  if (open !== trackedOpen) {
    setTrackedOpen(open);
    if (!open) {
      setState(EMPTY_COMPOSE_FORM_STATE);
      setErrors({});
    }
  }

  // Focus the panel on open; on close, return focus and rearm the guard.
  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      containerRef.current?.focus();
    } else {
      previouslyFocusedRef.current?.focus();
      previouslyFocusedRef.current = null;
      isSubmittingRef.current = false;
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
    if (isSubmittingRef.current) return; // see isSubmittingRef above
    isSubmittingRef.current = true;

    const validationErrors = validateComposeForm(state, {
      recipient: labels.recipient.error,
      title: labels.title.error,
      content: labels.content.error,
      hashtags: labels.hashtags.error,
      nickname: labels.anonymous.error,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      isSubmittingRef.current = false; // not a real submit — let the guard reset
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
            className="flex max-h-[90vh] w-full max-w-188 flex-col gap-8 overflow-y-auto rounded-3xl bg-[#FFF8E1] p-10 text-[#00101A] outline-none"
          >
            <h2 className="font-montserrat text-center text-[32px] leading-10 font-bold text-[#00101A]">
              {labels.dialogTitle}
            </h2>

            <ComposeDialogFields
              state={state}
              errors={errors}
              updateState={updateState}
              labels={labels}
              recipientOptions={recipientOptions}
              mentionNames={mentionNames}
            />

            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={onClose}
                className="flex shrink-0 items-center gap-2 rounded border border-[#998C5F] bg-[#FFEA9E]/10 px-10 py-4 text-base font-bold tracking-[0.15px] text-[#00101A] hover:bg-[#FFEA9E]/20"
              >
                {labels.cancel}
                <CloseIcon />
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#FFEA9E] p-4 text-[22px] leading-7 font-bold text-[#00101A] hover:opacity-90"
              >
                {labels.submit}
                <SendIcon />
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
