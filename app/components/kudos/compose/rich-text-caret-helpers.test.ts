import { describe, expect, it } from "vitest";
import {
  computeMentionInsertion,
  getCaretMentionToken,
  placeCaretAt,
  placeCaretAtEnd,
} from "./rich-text-caret-helpers";

/** Appends a fresh element with `text` and places a collapsed live caret at
 * `offset`, mirroring how `RichTextEditor` positions the real DOM caret. */
function setCaretAfter(text: string, offset: number): HTMLDivElement {
  const el = document.createElement("div");
  document.body.appendChild(el);
  el.textContent = text;
  const textNode = el.firstChild as Text;
  const range = document.createRange();
  range.setStart(textNode, offset);
  range.collapse(true);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  return el;
}

describe("getCaretMentionToken", () => {
  it("returns no-caret when there is no live selection at all", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    el.textContent = "hello @an";
    window.getSelection()?.removeAllRanges();

    expect(getCaretMentionToken(el)).toEqual({ kind: "no-caret" });
  });

  it("returns no-match when the caret isn't right after an @token", () => {
    const el = setCaretAfter("hello world", 5);
    expect(getCaretMentionToken(el)).toEqual({ kind: "no-match" });
  });

  it("matches an @token ending exactly at the caret (token boundary)", () => {
    const el = setCaretAfter("hello @an", 9);
    expect(getCaretMentionToken(el)).toEqual({ kind: "match", query: "an", start: 6, end: 9 });
  });

  it("matches an @token typed mid-sentence, not just at the trailing end", () => {
    // "chào @an bạn nhé" — caret placed right after "@an" (offset 8).
    const el = setCaretAfter("chào @an bạn nhé", 8);
    expect(getCaretMentionToken(el)).toEqual({ kind: "match", query: "an", start: 5, end: 8 });
  });

  it("stops matching once a space follows the @token (token boundary)", () => {
    const el = setCaretAfter("hello @an ", 10);
    expect(getCaretMentionToken(el)).toEqual({ kind: "no-match" });
  });

  it("matches a bare trailing @ with an empty query", () => {
    const el = setCaretAfter("cảm ơn @", 8);
    expect(getCaretMentionToken(el)).toEqual({ kind: "match", query: "", start: 7, end: 8 });
  });
});

describe("computeMentionInsertion", () => {
  it("replaces the matched token with '@name ' and offsets the caret past it", () => {
    const result = computeMentionInsertion(
      "cảm ơn @an",
      { kind: "match", query: "an", start: 7, end: 10 },
      "Nguyễn Văn An",
    );

    expect(result.nextText).toBe("cảm ơn @Nguyễn Văn An ");
    expect(result.caretOffset).toBe(7 + "Nguyễn Văn An".length + 2);
  });

  it("inserts the mention mid-sentence, preserving the text after the token", () => {
    const result = computeMentionInsertion(
      "chào @an bạn nhé",
      { kind: "match", query: "an", start: 5, end: 8 },
      "Nguyễn Văn An",
    );

    expect(result.nextText).toBe("chào @Nguyễn Văn An  bạn nhé");
  });

  it("falls back to trailing-token regex replacement when there is no live caret", () => {
    const result = computeMentionInsertion("cảm ơn @an", { kind: "no-caret" }, "Nguyễn Văn An");

    expect(result.nextText).toBe("cảm ơn @Nguyễn Văn An ");
    expect(result.caretOffset).toBe(result.nextText.length);
  });

  it("falls back to trailing-token regex replacement on no-match too", () => {
    const result = computeMentionInsertion("cảm ơn @an", { kind: "no-match" }, "Nguyễn Văn An");
    expect(result.nextText).toBe("cảm ơn @Nguyễn Văn An ");
  });

  it("leaves text unchanged when there is no @token for the fallback regex to match", () => {
    const result = computeMentionInsertion("no token here", { kind: "no-caret" }, "Name");
    expect(result.nextText).toBe("no token here");
  });
});

describe("placeCaretAt / placeCaretAtEnd", () => {
  it("collapses the live selection at the given character offset", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    el.textContent = "hello world";

    placeCaretAt(el, 5);

    const range = window.getSelection()?.getRangeAt(0);
    expect(range?.collapsed).toBe(true);
    expect(range?.startOffset).toBe(5);
  });

  it("clamps an out-of-range offset to the text length", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    el.textContent = "hi";

    placeCaretAt(el, 100);

    expect(window.getSelection()?.getRangeAt(0).startOffset).toBe(2);
  });

  it("places the caret at the very end of the text via placeCaretAtEnd", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    el.textContent = "hello";

    placeCaretAtEnd(el);

    expect(window.getSelection()?.getRangeAt(0).startOffset).toBe(5);
  });

  it("selects the (empty) element contents without throwing when there is no text node", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);

    expect(() => placeCaretAt(el, 3)).not.toThrow();
    expect(window.getSelection()?.rangeCount).toBe(1);
  });
});
