import type { Dictionary } from "@/lib/i18n/dictionary";
import type { KudosPerson } from "@/lib/kudos/kudos-types";
import { AnonymousToggle } from "./anonymous-toggle";
import { ChevronDownIcon } from "./chevron-down-icon";
import type { ComposeFormErrors, ComposeFormState } from "./compose-form-helpers";
import { FieldGroup } from "./field-group";
import { HashtagInput } from "./hashtag-input";
import { ImageUpload } from "./image-upload";
import { RecipientSelect } from "./recipient-select";
import { RichTextEditor } from "./rich-text-editor";

export interface ComposeDialogFieldsProps {
  state: ComposeFormState;
  errors: ComposeFormErrors;
  updateState: (patch: Partial<ComposeFormState>, errorKeys?: (keyof ComposeFormErrors)[]) => void;
  labels: Dictionary["kudos"]["compose"];
  recipientOptions: KudosPerson[];
  mentionNames: string[];
}

/**
 * The "Viết Kudos" field stack — recipient, title, rich-text content,
 * hashtags, images, and the anonymous toggle — pulled out of
 * `compose-dialog.tsx` (F007, FR-22) so the dialog shell only owns state
 * and handlers, keeping both files under the 200-line cap. Purely
 * presentational/controlled: every value and change handler is threaded
 * through from the shell via `state`/`errors`/`updateState`.
 */
export function ComposeDialogFields({
  state,
  errors,
  updateState,
  labels,
  recipientOptions,
  mentionNames,
}: ComposeDialogFieldsProps) {
  return (
    <>
      {/* No `htmlFor` here: `RecipientSelect`'s trigger is a `<button>`
       * whose own text IS its accessible name (the placeholder or the
       * selected person) — a programmatically associated `<label>` would
       * override that with the static field label, hiding the current
       * selection from AT users. */}
      <FieldGroup label={labels.recipient.label} required>
        <RecipientSelect
          id="compose-recipient"
          options={recipientOptions}
          value={state.recipient}
          onChange={(recipient) => updateState({ recipient }, ["recipient"])}
          error={errors.recipient}
          labels={labels.recipient}
        />
      </FieldGroup>

      <FieldGroup
        label={labels.title.label}
        helper={labels.title.helper}
        htmlFor="compose-title"
        required
      >
        {/* Restyled to match the ground-truth dropdown-trigger `Button`
         * component (same visual family as `RecipientSelect`'s trigger:
         * space-between layout, 24px/16px padding, chevron affordance) —
         * the chevron is decorative only for now (`pointer-events-none`);
         * whether this becomes a real select-from-list is an open product
         * question tracked separately from this visual fix. */}
        <div className="relative flex items-center">
          <input
            id="compose-title"
            type="text"
            value={state.title}
            onChange={(event) => updateState({ title: event.target.value }, ["title"])}
            placeholder={labels.title.placeholder}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "compose-title-error" : undefined}
            className="w-full rounded-lg border border-[#998C5F] bg-white py-4 pr-10 pl-6 text-base text-[#00101A] outline-none placeholder:text-[#999]"
          />
          <span className="pointer-events-none absolute right-6 text-[#998C5F]">
            <ChevronDownIcon />
          </span>
        </div>
        {errors.title && (
          <p id="compose-title-error" className="text-xs font-semibold text-[#CF1322]">
            {errors.title}
          </p>
        )}
      </FieldGroup>

      {/* MoMorph's "Content" group (I520:11647;520:9874) wraps content/
       * hashtags/images with its own 24px gap, distinct from the panel's
       * outer 32px gap between top-level sections — a plain sibling list
       * here would inflate all three gaps to 32px. */}
      <div className="flex flex-col gap-6">
        <RichTextEditor
          value={state.content}
          onChange={(content) => updateState({ content }, ["content"])}
          mentionNames={mentionNames}
          error={errors.content}
          // `communityStandards` moved from `content.communityStandards`
          // (string) to its own `compose.communityStandards` object (Phase 1,
          // FR-23) — forward the whole object so `CommunityStandardsLink` can
          // render the real "Thể lệ" panel (Phase 3), not just the trigger label.
          labels={{ ...labels.content, communityStandards: labels.communityStandards }}
        />

        <FieldGroup label={labels.hashtags.label} htmlFor="compose-hashtags" required>
          <HashtagInput
            id="compose-hashtags"
            value={state.hashtags}
            onChange={(hashtags) => updateState({ hashtags }, ["hashtags"])}
            error={errors.hashtags}
            labels={labels.hashtags}
          />
        </FieldGroup>

        <FieldGroup label={labels.images.label} htmlFor="compose-images">
          <ImageUpload
            id="compose-images"
            value={state.images}
            onChange={(images) => updateState({ images })}
            labels={labels.images}
          />
        </FieldGroup>
      </div>

      <AnonymousToggle
        checked={state.anonymous}
        onCheckedChange={(anonymous) => updateState({ anonymous })}
        nickname={state.nickname}
        onNicknameChange={(nickname) => updateState({ nickname }, ["nickname"])}
        nicknameError={errors.nickname}
        labels={labels.anonymous}
      />
    </>
  );
}
