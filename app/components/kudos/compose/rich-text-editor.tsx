"use client";

import { useEffect, useRef, useState } from "react";
import { CommunityStandardsLink } from "./community-standards-link";
import { filterMentionNames, MentionSuggestions } from "./mention-suggestions";
import { RichTextToolbar, type RichTextToolbarLabels } from "./rich-text-toolbar";

export interface RichTextEditorLabels {
  placeholder: string;
  mentionHint: string;
  counterMax: string;
  error: string;
  toolbar: RichTextToolbarLabels;
  communityStandards: string;
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

/** Matches an "@token" ending at whatever position it's tested against —
 * used both against the text up to the live caret (the common case) and,
 * as a fallback, against the full text when no live caret position is
 * available (e.g. a test/integration writing `textContent` directly). */
const MENTION_TOKEN_REGEX = /@(\w*)$/;

type CaretMentionToken =
  | { kind: "no-caret" }
  | { kind: "no-match" }
  | { kind: "match"; query: string; start: number; end: number };

/**
 * Locates the "@token" immediately before the live caret, if any — so
 * `@name` triggers suggestions no matter where in the message it's typed,
 * not just at the very end. `kind: "no-caret"` means the current selection
 * isn't positioned inside `el` at all (e.g. a programmatic `textContent`
 * write with no real caret); callers fall back to trailing-text matching
 * in that case instead of treating "no caret" as "no mention".
 */
function getCaretMentionToken(el: HTMLElement): CaretMentionToken {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return { kind: "no-caret" };

  const liveRange = selection.getRangeAt(0);
  if (!el.contains(liveRange.startContainer)) return { kind: "no-caret" };

  const preCaretRange = liveRange.cloneRange();
  preCaretRange.selectNodeContents(el);
  preCaretRange.setEnd(liveRange.startContainer, liveRange.startOffset);
  const textBeforeCaret = preCaretRange.toString();

  const match = MENTION_TOKEN_REGEX.exec(textBeforeCaret);
  if (!match) return { kind: "no-match" };

  return {
    kind: "match",
    query: match[1],
    start: textBeforeCaret.length - match[0].length,
    end: textBeforeCaret.length,
  };
}

/**
 * Minimal `contentEditable`-based rich text editor (F007, FR-6..10). No
 * rich-text library exists in this repo (clarifications.md) — formatting
 * is applied via `document.execCommand`, purely visual; only the element's
 * `textContent` is ever persisted (`onChange`), so `KudosPost.content`
 * stays a plain string and no HTML is stored or rendered downstream.
 *
 * The editable region is intentionally NOT re-synced from `value` after
 * mount (only used once, as the initial seed) — a fully-controlled
 * `contentEditable` fights the browser over caret position on every
 * keystroke. The compose dialog always mounts this fresh (empty `value`)
 * after a reset/close, which is sufficient for this feature's needs.
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

  // A new query means the filtered candidate list likely changed —
  // re-highlight the top match rather than keeping a now-stale index.
  // Adjusted during render (React's documented pattern for "reset state
  // when a value changes") instead of in an effect, so this doesn't cause
  // an extra commit-then-recommit render pass.
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

    let nextText: string;
    let caretOffset: number;
    if (caretToken.kind === "match") {
      nextText = `${text.slice(0, caretToken.start)}@${name} ${text.slice(caretToken.end)}`;
      caretOffset = caretToken.start + name.length + 2;
    } else {
      nextText = text.replace(MENTION_TOKEN_REGEX, `@${name} `);
      caretOffset = nextText.length;
    }

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
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <RichTextToolbar exec={exec} labels={labels.toolbar} />
        <CommunityStandardsLink label={labels.communityStandards} />
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
          className="min-h-[140px] w-full rounded-lg border border-white/20 bg-[#101317] p-3 text-sm text-white outline-none empty:before:text-white/40 empty:before:content-[attr(data-placeholder)]"
        />
        <MentionSuggestions
          names={mentionNames}
          query={mentionQuery ?? ""}
          onSelect={handleMentionSelect}
          open={mentionQuery !== null}
          highlightedIndex={highlightedMentionIndex}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-white/50">
        <span>{labels.mentionHint}</span>
        <span>
          {count}/{labels.counterMax}
        </span>
      </div>

      {error && (
        <p id="compose-content-error" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function placeCaretAtEnd(el: HTMLElement) {
  placeCaretAt(el, el.textContent?.length ?? 0);
}

/** Places the caret at a plain character offset within `el`'s text. Only
 * called right after `el.textContent` is fully reassigned (truncation,
 * mention insertion), so `el` always has at most one text-node child at
 * that point — no multi-node offset math needed. */
function placeCaretAt(el: HTMLElement, offset: number) {
  if (typeof window === "undefined" || typeof document.createRange !== "function") return;
  const range = document.createRange();
  const textNode = el.firstChild;
  if (textNode) {
    const safeOffset = Math.min(offset, textNode.textContent?.length ?? 0);
    range.setStart(textNode, safeOffset);
  } else {
    range.selectNodeContents(el);
  }
  range.collapse(true);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
