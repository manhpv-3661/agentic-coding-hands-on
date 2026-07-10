import { PlusIcon } from "./plus-icon";

export interface ChipAddTriggerProps {
  /** Id applied to the trigger `<button>` itself. `hashtag-input.tsx` wires
   * this to the wrapping `FieldGroup`'s `htmlFor`; `image-upload.tsx` puts
   * `id` on its own hidden file input instead and omits this prop. */
  id?: string;
  ariaLabel: string;
  onClick: () => void;
  /** Field caption, the trigger's first text line (e.g. "Hashtag" /
   * "Image"). */
  label: string;
  /** Max-count hint, the trigger's second text line (e.g. "Tối đa 5"). */
  max: string;
}

/**
 * Closed "+X" chip trigger shared by `HashtagInput`'s "+Hashtag" button and
 * `ImageUpload`'s "+Image" button (ground truth componentId 186:2757, both
 * instance the same component) — byte-identical markup/classes previously
 * duplicated in both files. An explicit `aria-label` is always required from
 * the caller: when `id` doubles as a `FieldGroup`'s `htmlFor` target, the
 * native label/control pairing would otherwise override this button's own
 * "+Hashtag"/"+Image" text with the field label's shorter text as the
 * accessible name.
 */
export function ChipAddTrigger({ id, ariaLabel, onClick, label, max }: ChipAddTriggerProps) {
  return (
    <button
      id={id}
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="inline-flex h-12 items-center gap-1 rounded-lg border border-[#998C5F] bg-white px-2 py-1 transition-colors duration-150 hover:bg-[#FFF8E1]"
    >
      <PlusIcon />
      {/* Ground truth's trigger caption is one two-line TEXT node
       * ("Hashtag\nTối đa 5" / "Image\nTối đa 5") rather than a single-line
       * "+X" — the word and the max-count hint are always shown together. */}
      <span className="flex flex-col text-left text-[11px] leading-4 font-bold tracking-[0.5px] text-[#999]">
        <span>{label}</span>
        <span>{max}</span>
      </span>
    </button>
  );
}
