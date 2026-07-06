export interface MentionSuggestionsProps {
  /** Candidate names to suggest — the same distinct-people list used by
   * `RecipientSelect` (F007, FR-7). */
  names: string[];
  /** Text typed after "@" so far (no "@" prefix). */
  query: string;
  onSelect: (name: string) => void;
  open: boolean;
}

/**
 * Inline "@mention" suggestion list shown by `RichTextEditor` while the
 * user is typing a trailing `@token` (F007, FR-7). Selecting a name inserts
 * plain `@Name` text — not a rich "mention object" — since
 * `KudosPost.content` stays a plain string (no type-contract change).
 */
export function MentionSuggestions({ names, query, onSelect, open }: MentionSuggestionsProps) {
  if (!open) return null;

  const filtered = names.filter((name) => name.toLowerCase().includes(query.toLowerCase()));
  if (filtered.length === 0) return null;

  return (
    <ul
      role="listbox"
      aria-label="mention-suggestions"
      className="absolute z-20 mt-1 flex max-h-40 flex-col gap-1 overflow-y-auto rounded-md border border-white/20 bg-[#101317] p-1 shadow-lg"
    >
      {filtered.map((name) => (
        <li key={name}>
          <button
            type="button"
            role="option"
            aria-selected={false}
            onClick={() => onSelect(name)}
            className="w-full rounded-md px-2 py-1 text-left text-sm text-white hover:bg-white/10"
          >
            @{name}
          </button>
        </li>
      ))}
    </ul>
  );
}
