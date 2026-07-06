export interface MentionSuggestionsProps {
  /** Candidate names to suggest — the same distinct-people list used by
   * `RecipientSelect` (F007, FR-7). */
  names: string[];
  /** Text typed after "@" so far (no "@" prefix). */
  query: string;
  onSelect: (name: string) => void;
  open: boolean;
  /** Index (into the filtered list) highlighted by ArrowUp/ArrowDown —
   * `RichTextEditor` owns the keydowns since the caret stays in the
   * `contentEditable` while this popup is open. Defaults to the first
   * option. */
  highlightedIndex?: number;
}

/** Case-insensitive substring filter shared with `RichTextEditor`'s
 * keyboard navigation, so both always agree on the same candidate list
 * (DRY) without either component needing the other's full state. */
export function filterMentionNames(names: string[], query: string): string[] {
  return names.filter((name) => name.toLowerCase().includes(query.toLowerCase()));
}

/**
 * Inline "@mention" suggestion list shown by `RichTextEditor` while the
 * user is typing a trailing `@token` (F007, FR-7). Selecting a name inserts
 * plain `@Name` text — not a rich "mention object" — since
 * `KudosPost.content` stays a plain string (no type-contract change).
 *
 * A mousedown on any option is prevented from the default focus shift so
 * clicking a suggestion never blurs the `contentEditable` first — otherwise
 * the popup would unmount (on blur) before its own click handler could run.
 */
export function MentionSuggestions({
  names,
  query,
  onSelect,
  open,
  highlightedIndex = 0,
}: MentionSuggestionsProps) {
  if (!open) return null;

  const filtered = filterMentionNames(names, query);
  if (filtered.length === 0) return null;

  return (
    <ul
      role="listbox"
      aria-label="mention-suggestions"
      onMouseDown={(event) => event.preventDefault()}
      className="absolute z-20 mt-1 flex max-h-40 flex-col gap-1 overflow-y-auto rounded-md border border-white/20 bg-[#101317] p-1 shadow-lg"
    >
      {filtered.map((name, index) => (
        <li key={name}>
          <button
            type="button"
            role="option"
            aria-selected={index === highlightedIndex}
            onClick={() => onSelect(name)}
            className={`w-full rounded-md px-2 py-1 text-left text-sm text-white hover:bg-white/10 ${
              index === highlightedIndex ? "bg-white/10" : ""
            }`}
          >
            @{name}
          </button>
        </li>
      ))}
    </ul>
  );
}
