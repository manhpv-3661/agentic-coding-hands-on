// Shared with `compose-dialog-fields.tsx`'s title input — both fields render
// the exact same bordered/rounded text-input chrome (ground truth: identical
// class cluster was duplicated verbatim in both files). Aligns with
// `insert-link-dialog.tsx`'s local `FIELD_CLASS` pattern, exported here
// since `compose-dialog-fields.tsx` already imports `AnonymousToggle` from
// this module.
export const INPUT_FIELD_CLASS =
  "h-14 w-full rounded-lg border border-[#998C5F] bg-white px-4 text-base font-bold text-[#00101A] placeholder:text-[#999] focus:outline-none";

export interface AnonymousToggleLabels {
  checkbox: string;
  nicknameLabel: string;
  nicknamePlaceholder: string;
  error: string;
}

export interface AnonymousToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  nickname: string;
  onNicknameChange: (value: string) => void;
  /** Inline validation for the nickname field, only relevant while
   * `checked` (F007, FR-19). */
  nicknameError?: string;
  labels: AnonymousToggleLabels;
}

export function AnonymousToggle({
  checked,
  onCheckedChange,
  nickname,
  onNicknameChange,
  nicknameError,
  labels,
}: AnonymousToggleProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-4 text-[22px] leading-7 font-bold text-[#999]">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
          className="h-6 w-6 rounded border-[#999] bg-white accent-[#00101A]"
        />
        {labels.checkbox}
      </label>
      {checked && (
        <div className="ml-10 flex max-w-[480px] flex-col gap-2">
          <label htmlFor="compose-anonymous-nickname" className="text-base font-bold text-[#00101A]">
            {labels.nicknameLabel}
          </label>
          <input
            id="compose-anonymous-nickname"
            type="text"
            value={nickname}
            onChange={(event) => onNicknameChange(event.target.value)}
            placeholder={labels.nicknamePlaceholder}
            className={INPUT_FIELD_CLASS}
          />
          {nicknameError && (
            <p className="text-sm font-bold text-[#D4271D]">{nicknameError}</p>
          )}
        </div>
      )}
    </div>
  );
}
