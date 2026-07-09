export interface FieldErrorProps {
  /** Id applied to the `<p>` itself, so a sibling control's
   * `aria-describedby` can point at it. */
  id?: string;
  children: string;
}

/**
 * Shared inline field-error paragraph — dedupes the byte-identical
 * `text-xs font-semibold text-[#CF1322]` markup previously repeated at 4
 * sites (`hashtag-input.tsx`, `rich-text-editor.tsx`, `insert-link-dialog.tsx`,
 * `hashtag-catalog-dropdown.tsx`'s sibling group). Intentionally does NOT
 * cover the 2 other, visually-DIFFERENT error paragraphs
 * (`text-sm font-bold text-[#D4271D]` in `anonymous-toggle.tsx` and
 * `compose-dialog-fields.tsx`'s title field) — unifying those would change
 * their rendered color/size, which this phase's zero-behavior-change
 * mandate forbids. See `plans/260709-1710-ui-refactor-cleanup/phase-01-kudos-compose-dedup.md`.
 */
export function FieldError({ id, children }: FieldErrorProps) {
  return (
    <p id={id} className="text-xs font-semibold text-[#CF1322]">
      {children}
    </p>
  );
}
