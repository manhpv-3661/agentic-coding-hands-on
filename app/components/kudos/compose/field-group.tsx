import type { ReactNode } from "react";

export interface FieldGroupProps {
  label: string;
  /** Id of the control `children` renders — wires the label to it via
   * `htmlFor` so clicking/tapping the label focuses the field and screen
   * readers announce the field's accessible name. */
  htmlFor?: string;
  helper?: string;
  children: ReactNode;
}

/** Shared "bold label + control + optional helper text" wrapper used by
 * several `compose-dialog.tsx` fields (Danh hiệu, Hashtag, Image) — pulled
 * out to keep the dialog shell itself under the 200-line file cap. */
export function FieldGroup({ label, htmlFor, helper, children }: FieldGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-white">
        {label}
      </label>
      {children}
      {helper && <p className="whitespace-pre-line text-xs text-white/50">{helper}</p>}
    </div>
  );
}
