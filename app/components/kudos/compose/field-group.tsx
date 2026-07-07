import type { ReactNode } from "react";

export interface FieldGroupProps {
  label: string;
  /** Id of the control `children` renders — wires the label to it via
   * `htmlFor` so clicking/tapping the label focuses the field and screen
   * readers announce the field's accessible name. */
  htmlFor?: string;
  helper?: string;
  /** Shows a red required-field asterisk next to the label. MoMorph ground
   * truth (screen ihQ26W78P2) marks Recipient, Danh hiệu, and Hashtag with
   * `*`; clarifications.md records these three (plus the conditionally
   * required Nickname, handled separately in `anonymous-toggle.tsx`) as the
   * required fields for this form. */
  required?: boolean;
  children: ReactNode;
}

/** Shared "label beside control" row used by several `compose-dialog.tsx`
 * fields (Recipient, Danh hiệu, Hashtag, Image) — pulled out to keep the
 * dialog shell itself under the 200-line file cap. Label sits beside the
 * control per MoMorph ground truth (screen ihQ26W78P2: `mms_B_Chọn người
 * nhận`, `Frame 552`, `mms_E_Frame 536` all lay the shared label component
 * out in a `flex-row` beside the control, 22px/700 Montserrat). */
export function FieldGroup({ label, htmlFor, helper, required, children }: FieldGroupProps) {
  return (
    // items-start (not items-center): a helper line under the control would
    // otherwise pull the centered label down, off the control's top edge —
    // MoMorph ground truth keeps the label aligned with the control row.
    <div className="flex flex-row items-start gap-4">
      <label
        htmlFor={htmlFor}
        className="flex shrink-0 items-center gap-0.5 whitespace-nowrap"
      >
        <span className="font-montserrat text-[22px] leading-7 font-bold text-[#00101A]">
          {label}
        </span>
        {required && (
          // MoMorph ground truth (nodes 520:9872/1688:10436/520:9891) styles
          // the "*" as its own TEXT node — 16px/700/20px-leading Noto Sans
          // JP — distinct from the 22px Montserrat label beside it. This
          // repo has no Noto Sans JP face loaded (app/fonts.ts is outside
          // this fix's file scope), so the family falls back to the
          // inherited sans-serif; size/weight/line-height/color are matched
          // exactly, which is the visible fidelity gap the defect flagged.
          <span
            className="text-[16px] leading-5 font-bold text-[#CF1322]"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>
      <div className="flex flex-1 flex-col gap-2">
        {children}
        {helper && (
          <p className="whitespace-pre-line text-base font-bold leading-6 tracking-[0.15px] text-[#999]">
            {helper}
          </p>
        )}
      </div>
    </div>
  );
}
