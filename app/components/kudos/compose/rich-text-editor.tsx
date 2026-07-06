"use client";

import { useEffect, useRef, useState } from "react";
import { CommunityStandardsLink } from "./community-standards-link";
import { MentionSuggestions } from "./mention-suggestions";
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

/** Matches a trailing "@token" so far typed — used to drive the mention
 * suggestion list (F007, FR-7). Intentionally simple (no caret-position
 * tracking): only the text's trailing token is considered, which is
 * sufficient for "type @, pick a name" and avoids contentEditable Range
 * gymnastics (see clarifications.md risk note). */
const MENTION_TOKEN_REGEX = /@(\w*)$/;

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

  useEffect(() => {
    if (editorRef.current && value) {
      editorRef.current.textContent = value;
      setCount(value.length);
    }
    // Intentional one-time seed — see the component doc comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    const match = MENTION_TOKEN_REGEX.exec(text);
    setMentionQuery(match ? match[1] : null);
  }

  function handleMentionSelect(name: string) {
    const el = editorRef.current;
    if (!el) return;
    const text = (el.textContent ?? "").replace(MENTION_TOKEN_REGEX, `@${name} `);
    el.textContent = text;
    placeCaretAtEnd(el);
    setCount(text.length);
    onChange(text);
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
          data-placeholder={labels.placeholder}
          onInput={handleInput}
          className="min-h-[140px] w-full rounded-lg border border-white/20 bg-[#101317] p-3 text-sm text-white outline-none empty:before:text-white/40 empty:before:content-[attr(data-placeholder)]"
        />
        <MentionSuggestions
          names={mentionNames}
          query={mentionQuery ?? ""}
          onSelect={handleMentionSelect}
          open={mentionQuery !== null}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-white/50">
        <span>{labels.mentionHint}</span>
        <span>
          {count}/{labels.counterMax}
        </span>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function placeCaretAtEnd(el: HTMLElement) {
  if (typeof window === "undefined" || typeof document.createRange !== "function") return;
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
