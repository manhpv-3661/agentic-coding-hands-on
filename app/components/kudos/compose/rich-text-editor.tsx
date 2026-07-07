"use client";

import { useEffect, useRef, useState } from "react";
import { CommunityStandardsLink } from "./community-standards-link";
import { filterMentionNames, MentionSuggestions } from "./mention-suggestions";
import {
  computeMentionInsertion,
  getCaretMentionToken,
  MENTION_TOKEN_REGEX,
  placeCaretAt,
  placeCaretAtEnd,
} from "./rich-text-caret-helpers";
import { RichTextToolbar, type RichTextToolbarLabels } from "./rich-text-toolbar";

export interface RichTextEditorLabels {
  placeholder: string;
  mentionHint: string;
  counterMax: string;
  error: string;
  toolbar: RichTextToolbarLabels;
  communityStandards: Parameters<typeof CommunityStandardsLink>[0]["labels"];
}

export interface RichTextEditorProps {
  value: string;
  onChange: (text: string) => void;
  /** Distinct people names offered by "@" suggestions (F007, FR-7). */
  mentionNames: string[];
  /** Hard character cap, enforced live (default 1000, matches the Figma
   * "0/1.000" counter). */
  maxLength?: number;
  error?: string;
  labels: RichTextEditorLabels;
}

/**
 * Minimal `contentEditable`-based rich text editor (F007, FR-6..10, style
 * per FR-22). No rich-text library exists in this repo — formatting is
 * applied via `document.execCommand`, visual only; `textContent` is the
 * sole persisted value (`onChange`). Not re-synced from `value` after
 * mount (initial seed only) — a fully-controlled `contentEditable` fights
 * the browser over caret position on every keystroke. Caret/mention string
 * math lives in `rich-text-caret-helpers.ts` (pure functions) so this
 * component only wires DOM reads/writes to them.
 */
export function RichTextEditor({
  value,
  onChange,
  mentionNames,
  maxLength = 1000,
  error,
  labels,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [highlightedMentionIndex, setHighlightedMentionIndex] = useState(0);

  useEffect(() => {
    if (editorRef.current && value) {
      editorRef.current.textContent = value;
      setCount(value.length);
    }
    // Intentional one-time seed — see the component doc comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-highlight the top match whenever the query changes (render-phase
  // reset, avoids an extra commit-then-recommit render pass).
  const [trackedMentionQuery, setTrackedMentionQuery] = useState<string | null>(null);
  if (mentionQuery !== trackedMentionQuery) {
    setTrackedMentionQuery(mentionQuery);
    setHighlightedMentionIndex(0);
  }

  const filteredMentionNames = mentionQuery !== null ? filterMentionNames(mentionNames, mentionQuery) : [];

  function exec(command: string, arg?: string) {
    editorRef.current?.focus();
    try {
      if (typeof document.execCommand === "function") {
        document.execCommand(command, false, arg);
      }
    } catch {
      // execCommand is deprecated and not fully implemented everywhere
      // (e.g. jsdom) — formatting here is visual-only, so a no-op is
      // harmless for this mock editor.
    }
    handleInput();
  }

  function handleInput() {
    const el = editorRef.current;
    if (!el) return;
    let text = el.textContent ?? "";

    if (text.length > maxLength) {
      text = text.slice(0, maxLength);
      el.textContent = text;
      placeCaretAtEnd(el);
    }

    setCount(text.length);
    onChange(text);

    const caretToken = getCaretMentionToken(el);
    if (caretToken.kind === "no-caret") {
      // No live caret to anchor on (e.g. a direct `textContent` write) —
      // fall back to the previous trailing-token behavior.
      const trailingMatch = MENTION_TOKEN_REGEX.exec(text);
      setMentionQuery(trailingMatch ? trailingMatch[1] : null);
    } else {
      setMentionQuery(caretToken.kind === "match" ? caretToken.query : null);
    }
  }

  function handleMentionSelect(name: string) {
    const el = editorRef.current;
    if (!el) return;
    const text = el.textContent ?? "";
    const caretToken = getCaretMentionToken(el);
    const { nextText, caretOffset } = computeMentionInsertion(text, caretToken, name);

    el.textContent = nextText;
    placeCaretAt(el, caretOffset);
    setCount(nextText.length);
    onChange(nextText);
    setMentionQuery(null);
  }

  function handleEditorKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (mentionQuery === null || filteredMentionNames.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedMentionIndex((index) => (index + 1) % filteredMentionNames.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedMentionIndex(
        (index) => (index - 1 + filteredMentionNames.length) % filteredMentionNames.length,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      handleMentionSelect(filteredMentionNames[highlightedMentionIndex]);
    } else if (event.key === "Escape") {
      setMentionQuery(null);
    }
  }

  function handleEditorBlur() {
    setMentionQuery(null);
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Toolbar row + textarea share no gap (ground truth: toolbar endY ==
       * textarea startY, one continuous bordered card) — grouped in their
       * own gap-less wrapper so the outer flex-col's gap only applies
       * between this unit and the hint/counter row below it. */}
      <div className="flex flex-col">
        {/* One continuous 672px bordered strip (ground truth: 6 icon cells
         * + the community-standards cell sum to exactly 672px, no gap) —
         * this container owns the single border and the top-left/top-right
         * rounding; `RichTextToolbar` and `CommunityStandardsLink` render
         * their cells borderless/gapless inside it. */}
        <div className="flex items-stretch overflow-hidden rounded-t-lg border border-[#998C5F] bg-white">
          <RichTextToolbar exec={exec} labels={labels.toolbar} />
          <CommunityStandardsLink labels={labels.communityStandards} />
        </div>

        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            role="textbox"
            aria-multiline="true"
            aria-label={labels.placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "compose-content-error" : undefined}
            data-placeholder={labels.placeholder}
            onInput={handleInput}
            onKeyDown={handleEditorKeyDown}
            onBlur={handleEditorBlur}
            className="min-h-50 w-full rounded-b-lg border border-[#998C5F] bg-white pl-6 text-sm text-[#00101A] outline-none empty:before:whitespace-pre-line empty:before:text-[#999] empty:before:content-[attr(data-placeholder)]"
          />
          <MentionSuggestions
            names={mentionNames}
            query={mentionQuery ?? ""}
            onSelect={handleMentionSelect}
            open={mentionQuery !== null}
            highlightedIndex={highlightedMentionIndex}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[#00101A]">
        <span className="text-base font-bold leading-6 tracking-[0.5px]">{labels.mentionHint}</span>
        <span className="text-xs text-[#999]">
          {count}/{labels.counterMax}
        </span>
      </div>

      {error && (
        <p id="compose-content-error" className="text-xs font-semibold text-[#CF1322]">
          {error}
        </p>
      )}
    </div>
  );
}
