import { useState } from "react";
import { InsertLinkDialog, type InsertLinkDialogLabels } from "./insert-link-dialog";

export interface RichTextToolbarLabels {
  bold: string;
  italic: string;
  strikethrough: string;
  list: string;
  link: string;
  quote: string;
  /** Labels for the `InsertLinkDialog` opened by the link button (FR-24). */
  addLink: InsertLinkDialogLabels;
}

export interface RichTextToolbarProps {
  /** Runs `document.execCommand(command, false, arg)` (guarded by the
   * caller for jsdom-safety) — kept as a prop so this component stays a
   * pure, easily-testable button row (FR-6). */
  exec: (command: string, arg?: string) => void;
  labels: RichTextToolbarLabels;
}

const ICON_PROPS = { width: 24, height: 24, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true } as const;

function BoldIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path
        d="M4 2h4.5a2.75 2.75 0 0 1 1.44 5.09A3 3 0 0 1 8.75 13H4V2Zm2 1.6v3.2h2.5a1.6 1.6 0 1 0 0-3.2H6Zm0 4.8v3h2.75a1.5 1.5 0 0 0 0-3H6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M6.5 2.5h5v1.4H9.9l-2.3 8.2H9.5V13h-5v-1.4h1.6l2.3-8.2H6.5V2.5Z" fill="currentColor" />
    </svg>
  );
}

function StrikethroughIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path
        d="M2.5 7.5h11v1.2h-11V7.5ZM5 5.1c0-1.5 1.4-2.6 3.1-2.6 1.5 0 2.7.7 3.2 1.8l-1.3.6c-.3-.6-1-1-1.9-1-.9 0-1.7.5-1.7 1.2 0 .5.3.8 1 1H5.2A2.3 2.3 0 0 1 5 5.1Zm1.9 4.8h1.7c.1.3.2.5.2.8 0 .8-.8 1.3-1.9 1.3-1 0-1.9-.4-2.2-1.2l-1.3.6c.5 1.2 1.8 2 3.5 2 2 0 3.5-1.1 3.5-2.7 0-.3-.1-.6-.2-.8H6.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Ground-truth `MM_MEDIA_Number List` icon (cell `mms_C.4_number`,
 * componentId 662:10338) — a numbered/ordered list glyph (digit marks, not
 * bullet dots), wired to `insertOrderedList` below. */
function NumberListIcon() {
  return (
    <svg {...ICON_PROPS}>
      <text x="1.4" y="4.9" fontSize="3.2" fontWeight="700" fill="currentColor">
        1
      </text>
      <text x="1.4" y="8.9" fontSize="3.2" fontWeight="700" fill="currentColor">
        2
      </text>
      <text x="1.4" y="12.9" fontSize="3.2" fontWeight="700" fill="currentColor">
        3
      </text>
      <path d="M5.5 3.3h8v1.4h-8V3.3Zm0 4h8v1.4h-8v-1.4Zm0 4h8v1.4h-8v-1.4Z" fill="currentColor" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path
        d="M6.9 9.1a2.6 2.6 0 0 1 0-3.7l1.8-1.8a2.6 2.6 0 0 1 3.7 3.7l-1 1-1-1 1-1a1.2 1.2 0 0 0-1.7-1.7L7.9 6.4a1.2 1.2 0 0 0 0 1.7l-1 1Zm2.2-2.2a2.6 2.6 0 0 1 0 3.7l-1.8 1.8a2.6 2.6 0 0 1-3.7-3.7l1-1 1 1-1 1a1.2 1.2 0 0 0 1.7 1.7l1.8-1.8a1.2 1.2 0 0 0 0-1.7l1-1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path
        d="M3 5.5c0-1.7 1.3-3 3-3v1.4c-.9 0-1.6.7-1.6 1.6H6v3.5H3V5.5Zm5.5 0c0-1.7 1.3-3 3-3v1.4c-.9 0-1.6.7-1.6 1.6h1.6v3.5h-3V5.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * The 6-button formatting row above the compose textarea (F007, FR-6;
 * restyled per FR-22 as a bordered white strip with real icon-buttons —
 * bare `B`/`I`/`S` glyphs replaced, but every `aria-label` and `exec(...)`
 * call is unchanged). No rich-text library exists in this repo
 * (clarifications.md) — each button invokes `document.execCommand` on the
 * parent's `contentEditable` region; icons are hand-drawn inline SVG
 * (matches the existing `kudos-card-icons.tsx` convention — no new icon
 * library dependency).
 */
export function RichTextToolbar({ exec, labels }: RichTextToolbarProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  // 56x40 segmented cells (ground truth I520:11647;520:9881/662:11119):
  // each button owns a left border shared with its neighbor. The strip's
  // own border/rounding lives one level up in `RichTextEditor`, which wraps
  // this row together with `CommunityStandardsLink`'s cell into one
  // continuous 672px bordered strip (ground truth: 6 icon cells + the
  // community-standards cell sum to exactly 672px, with no gap between
  // them) — so no per-button corner-radius math is needed here.
  const buttonClass =
    "flex h-10 w-14 shrink-0 items-center justify-center border-l border-[#998C5F] first:border-l-0 text-[#00101A] hover:bg-[#FFF8E1] focus-visible:bg-[#FFF8E1]";

  return (
    <>
      {/* No own border/rounding/background here — this row is one segment
       * of the single continuous 672px bordered strip owned by the parent
       * (`RichTextEditor`), shared with `CommunityStandardsLink`'s cell. */}
      <div className="flex items-stretch">
        <button type="button" aria-label={labels.bold} className={buttonClass} onClick={() => exec("bold")}>
          <BoldIcon />
        </button>
        <button type="button" aria-label={labels.italic} className={buttonClass} onClick={() => exec("italic")}>
          <ItalicIcon />
        </button>
        <button
          type="button"
          aria-label={labels.strikethrough}
          className={buttonClass}
          onClick={() => exec("strikeThrough")}
        >
          <StrikethroughIcon />
        </button>
        <button type="button" aria-label={labels.list} className={buttonClass} onClick={() => exec("insertOrderedList")}>
          <NumberListIcon />
        </button>
        <button
          type="button"
          aria-label={labels.link}
          className={buttonClass}
          onClick={() => setLinkDialogOpen(true)}
        >
          <LinkIcon />
        </button>
        <button
          type="button"
          aria-label={labels.quote}
          className={buttonClass}
          onClick={() => exec("formatBlock", "blockquote")}
        >
          <QuoteIcon />
        </button>
      </div>

      <InsertLinkDialog
        open={linkDialogOpen}
        onCancel={() => setLinkDialogOpen(false)}
        onSave={(url) => {
          exec("createLink", url);
          setLinkDialogOpen(false);
        }}
        labels={labels.addLink}
      />
    </>
  );
}
