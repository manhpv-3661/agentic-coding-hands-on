/** Ground-truth `MM_MEDIA_Down` icon (24x24, componentId 186:1862,
 * componentSetId 178:1020, screen ihQ26W78P2) — shared by every dropdown-
 * style trigger in the Kudos compose form (`RecipientSelect`'s "mms_B.2_
 * Search" trigger at node I520:11647;520:9873;186:2761 and the "Danh hiệu"
 * title trigger at I520:11647;1688:10437;186:2761 both instance this exact
 * component). Extracted out of `recipient-select.tsx` so `compose-dialog-
 * fields.tsx` can reuse the same SVG instead of a font-rendered Unicode "▾"
 * glyph. Decorative only — callers are expected to wrap it with
 * `aria-hidden="true"`. */
export function ChevronDownIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
