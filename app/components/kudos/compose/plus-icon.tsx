/** Ground-truth `MM_MEDIA_Plus` icon (24x24, screen ihQ26W78P2 node
 * I520:11647;662:8911's child, componentId 490:5726) — shared by every
 * closed "+X" chip trigger in the Kudos compose form (`hashtag-input.tsx`'s
 * "+Hashtag" trigger and `image-upload.tsx`'s "+Ảnh" trigger both instance
 * this exact component, componentId 186:2757). Extracted out of both files
 * (mirrors `chevron-down-icon.tsx`'s extraction) so there is one copy of
 * this SVG instead of two byte-identical inline copies. Decorative only;
 * the caller's own text carries the accessible name. */
export function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
