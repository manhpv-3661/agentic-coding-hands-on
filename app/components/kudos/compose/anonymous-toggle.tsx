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
 * "Gửi lời cảm ơn và ghi nhận ẩn danh" checkbox + conditional nickname
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
      <label className="flex items-center gap-2 text-sm text-white">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
          className="h-4 w-4 rounded border-white/30 bg-transparent"
        />
        {labels.checkbox}
      </label>

      {checked && (
        <div className="flex flex-col gap-1">
          <label htmlFor="compose-anonymous-nickname" className="text-sm font-semibold text-white">
            {labels.nicknameLabel}
          </label>
          <input
            id="compose-anonymous-nickname"
            type="text"
            value={nickname}
            onChange={(event) => onNicknameChange(event.target.value)}
            placeholder={labels.nicknamePlaceholder}
            aria-invalid={Boolean(nicknameError)}
            aria-describedby={nicknameError ? "compose-anonymous-nickname-error" : undefined}
            className="rounded-lg border border-white/20 bg-[#101317] px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
          />
          {nicknameError && (
            <p id="compose-anonymous-nickname-error" className="text-xs text-red-400">
              {nicknameError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
