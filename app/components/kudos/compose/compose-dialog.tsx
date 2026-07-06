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

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  function resetAndClose() {
    setState(EMPTY_COMPOSE_FORM_STATE);
    setErrors({});
    onClose();
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
    resetAndClose();

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
            className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-5 overflow-y-auto rounded-2xl bg-[#101317] p-6 text-white"
          >
            <h2 className="font-montserrat text-lg font-bold text-[#FFEA9E]">{labels.dialogTitle}</h2>

            <FieldGroup label={labels.recipient.label}>
              <RecipientSelect
                options={recipientOptions}
                value={state.recipient}
                onChange={(recipient) => setState((s) => ({ ...s, recipient }))}
                error={errors.recipient}
                labels={labels.recipient}
              />
            </FieldGroup>

            <FieldGroup label={labels.title.label} helper={labels.title.helper}>
              <input
                type="text"
                value={state.title}
                onChange={(event) => setState((s) => ({ ...s, title: event.target.value }))}
                placeholder={labels.title.placeholder}
                className="w-full rounded-lg border border-white/20 bg-[#101317] px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
              />
              {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
            </FieldGroup>

            <RichTextEditor
              value={state.content}
              onChange={(content) => setState((s) => ({ ...s, content }))}
              mentionNames={mentionNames}
              error={errors.content}
              labels={labels.content}
            />

            <FieldGroup label={labels.hashtags.label}>
              <HashtagInput
                value={state.hashtags}
                onChange={(hashtags) => setState((s) => ({ ...s, hashtags }))}
                error={errors.hashtags}
                labels={labels.hashtags}
              />
            </FieldGroup>

            <FieldGroup label={labels.images.label}>
              <ImageUpload
                value={state.images}
                onChange={(images) => setState((s) => ({ ...s, images }))}
                labels={labels.images}
              />
            </FieldGroup>

            <AnonymousToggle
              checked={state.anonymous}
              onCheckedChange={(anonymous) => setState((s) => ({ ...s, anonymous }))}
              nickname={state.nickname}
              onNicknameChange={(nickname) => setState((s) => ({ ...s, nickname }))}
              nicknameError={errors.nickname}
              labels={labels.anonymous}
            />

            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={resetAndClose}
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
