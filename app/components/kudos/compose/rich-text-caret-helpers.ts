/** Matches an "@token" ending at whatever position it's tested against —
 * used both against the text up to the live caret (the common case) and,
 * as a fallback, against the full text when no live caret position is
 * available (e.g. a test/integration writing `textContent` directly). */
export const MENTION_TOKEN_REGEX = /@(\w*)$/;

export type CaretMentionToken =
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
export function getCaretMentionToken(el: HTMLElement): CaretMentionToken {
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

/** Places the caret at a plain character offset within `el`'s text. Only
 * called right after `el.textContent` is fully reassigned (truncation,
 * mention insertion), so `el` always has at most one text-node child at
 * that point — no multi-node offset math needed. */
export function placeCaretAt(el: HTMLElement, offset: number) {
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

export function placeCaretAtEnd(el: HTMLElement) {
  placeCaretAt(el, el.textContent?.length ?? 0);
}

/**
 * Pure string computation for inserting `@name` at (or replacing) the
 * caret's mention token — extracted so `RichTextEditor` only has to do DOM
 * writes (`textContent`, `placeCaretAt`) with the resulting values, keeping
 * the component itself under the 200-line file cap.
 */
export function computeMentionInsertion(
  text: string,
  caretToken: CaretMentionToken,
  name: string,
): { nextText: string; caretOffset: number } {
  if (caretToken.kind === "match") {
    return {
      nextText: `${text.slice(0, caretToken.start)}@${name} ${text.slice(caretToken.end)}`,
      caretOffset: caretToken.start + name.length + 2,
    };
  }

  const nextText = text.replace(MENTION_TOKEN_REGEX, `@${name} `);
  return { nextText, caretOffset: nextText.length };
}
