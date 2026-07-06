export interface RichTextToolbarLabels {
  bold: string;
  italic: string;
  strikethrough: string;
  list: string;
  link: string;
  quote: string;
}

export interface RichTextToolbarProps {
  /** Runs `document.execCommand(command, false, arg)` (guarded by the
   * caller for jsdom-safety) — kept as a prop so this component stays a
   * pure, easily-testable button row (FR-6). */
  exec: (command: string, arg?: string) => void;
  labels: RichTextToolbarLabels;
}

/**
 * The 6-button formatting row above the compose textarea (F007, FR-6):
 * Bold / Italic / Strikethrough / bullet List / Link / Quote. No rich-text
 * library exists in this repo (clarifications.md) — each button simply
 * invokes `document.execCommand` on the parent's `contentEditable` region.
 */
export function RichTextToolbar({ exec, labels }: RichTextToolbarProps) {
  const buttonClass =
    "rounded-md px-2 py-1 text-sm font-semibold text-white/80 hover:bg-white/10";

  return (
    <div className="flex items-center gap-1 border-b border-white/10 pb-2">
      <button type="button" aria-label={labels.bold} className={`${buttonClass} font-bold`} onClick={() => exec("bold")}>
        B
      </button>
      <button type="button" aria-label={labels.italic} className={`${buttonClass} italic`} onClick={() => exec("italic")}>
        I
      </button>
      <button
        type="button"
        aria-label={labels.strikethrough}
        className={`${buttonClass} line-through`}
        onClick={() => exec("strikeThrough")}
      >
        S
      </button>
      <button type="button" aria-label={labels.list} className={buttonClass} onClick={() => exec("insertUnorderedList")}>
        •≡
      </button>
      <button
        type="button"
        aria-label={labels.link}
        className={buttonClass}
        onClick={() => {
          const url = typeof window !== "undefined" ? window.prompt("URL") : null;
          if (url) exec("createLink", url);
        }}
      >
        🔗
      </button>
      <button
        type="button"
        aria-label={labels.quote}
        className={buttonClass}
        onClick={() => exec("formatBlock", "blockquote")}
      >
        “”
      </button>
    </div>
  );
}
