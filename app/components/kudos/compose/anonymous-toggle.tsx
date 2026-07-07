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

/**
 * "Gửi lời cám ơn và ghi nhận ẩn danh" checkbox + conditional nickname
 * field (F007, FR-17..19). This component only collects `checked` +
 * `nickname` — the dialog shell decides the final `sender` substitution
 * (FR-18), keeping this leaf presentational/controlled.
 */
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
        <div className="flex flex-col gap-1">
          <label htmlFor="compose-anonymous-nickname" className="text-sm font-semibold text-[#00101A]">
            {labels.nicknameLabel}
            {/* Required only while `checked` — this branch only renders
             * then, so no extra prop is needed to gate it (F007
             * clarifications.md: Nickname shows `*` only when the
             * anonymous checkbox is on). */}
            <span className="text-[#CF1322]" aria-hidden="true">
              {" "}
              *
            </span>
          </label>
          <input
            id="compose-anonymous-nickname"
            type="text"
            value={nickname}
            onChange={(event) => onNicknameChange(event.target.value)}
            placeholder={labels.nicknamePlaceholder}
            aria-invalid={Boolean(nicknameError)}
            aria-describedby={nicknameError ? "compose-anonymous-nickname-error" : undefined}
            className="rounded-lg border border-[#998C5F] bg-white px-3 py-2 text-sm text-[#00101A] outline-none placeholder:text-[#999]"
          />
          {nicknameError && (
            <p id="compose-anonymous-nickname-error" className="text-xs font-semibold text-[#CF1322]">
              {nicknameError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
