import Image from "next/image";
import type { AwardMetric, AwardValueVariant } from "./award-detail-types";

interface AwardValueSectionProps {
  /** "Giá trị giải thưởng: " label prefix, shared across all cards
   * (`awards.detail.valueLabel`). */
  valueLabel: string;
  /** Pre-split `{ number, unit }` value metric, e.g. `{ number:
   * "7.000.000 VNĐ", unit: "cho mỗi giải thưởng" }` — used by every category
   * except "Signature 2025 - Creator". Ignored when `valueVariants` is set. */
  value?: AwardMetric;
  /** Two distinct value rows — individual then collective award amount —
   * split by a centered "orLabel" divider (mm:313:8490/313:8498/313:8501).
   * Set only for "Signature 2025 - Creator"; takes precedence over `value`. */
  valueVariants?: {
    orLabel: string;
    individual: AwardValueVariant;
    collective: AwardValueVariant;
  };
}

/**
 * One value block: icon+label row, then a large value figure, then a small
 * suffix line underneath (mm:313:8491 "Frame 443" — icon/label 313:8492,
 * value figure 313:8495, suffix 313:8497). Shared by all 3 render sites this
 * component used to be duplicated across (the two `valueVariants` rows plus
 * the single-`value` fallback).
 *
 * `guardEmptySuffix` preserves a real behavioral difference between the two
 * former call sites rather than papering over it: the single-`value`
 * fallback branch always guarded its suffix line with `unit &&` (some
 * categories have no "per award" caption), while the `valueVariants` rows
 * never guarded (both individual/collective suffixes are always populated
 * in practice) — collapsing them without this flag would risk silently
 * hiding/showing an empty `<p>` at the `valueVariants` call sites.
 */
function ValueBlock({
  valueLabel,
  number,
  suffix,
  guardEmptySuffix = false,
}: {
  valueLabel: string;
  number: string;
  suffix: string;
  guardEmptySuffix?: boolean;
}) {
  const showSuffix = guardEmptySuffix ? Boolean(suffix) : true;

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="flex items-center gap-4">
        <Image
          src="/awards-saa/Icon-License.svg"
          alt=""
          aria-hidden="true"
          width={24}
          height={24}
          className="h-6 w-6 shrink-0"
        />
        <span className="font-montserrat text-[24px] leading-[32px] font-bold text-[#FFEA9E]">
          {valueLabel}
        </span>
      </div>
      <p className="font-montserrat text-[36px] leading-[44px] font-bold text-white">{number}</p>
      {showSuffix && (
        <p className="font-montserrat text-[14px] leading-[20px] font-bold tracking-[0.1px] text-white">
          {suffix}
        </p>
      )}
    </div>
  );
}

/**
 * Renders the award-value row(s) below the quantity/value divider. Every
 * category except "Signature 2025 - Creator" shows one icon+label+value
 * line. Signature-Creator's `valueVariants` (mm:313:8490/313:8498/313:8501)
 * instead renders two full value blocks — individual then collective award
 * amount, genuinely different figures — split by a centered "orLabel"
 * divider (mm:313:8498 "Frame 524": the "Hoặc" text at 313:8499 followed by
 * a horizontal rule at 313:8500 filling the remaining row width).
 */
export function AwardValueSection({ valueLabel, value, valueVariants }: AwardValueSectionProps) {
  if (valueVariants) {
    return (
      <div className="flex w-full flex-col items-start gap-4">
        <ValueBlock
          valueLabel={valueLabel}
          number={valueVariants.individual.value}
          suffix={valueVariants.individual.suffix}
        />
        <div className="flex w-full items-center gap-2">
          <span className="font-montserrat text-[14px] leading-[20px] font-bold text-[#2E3940]">
            {valueVariants.orLabel}
          </span>
          <div className="h-px flex-1 bg-[#2E3940]" />
        </div>
        <ValueBlock
          valueLabel={valueLabel}
          number={valueVariants.collective.value}
          suffix={valueVariants.collective.suffix}
        />
      </div>
    );
  }

  // `value` is only optional in the type because it's mutually exclusive
  // with `valueVariants`; by the time we reach this branch (no
  // `valueVariants`), the data model guarantees it's set (`award-detail-data.ts`
  // always supplies one or the other). Empty fallback is defensive only.
  const { number, unit } = value ?? { number: "", unit: "" };

  return (
    <ValueBlock valueLabel={valueLabel} number={number} suffix={unit} guardEmptySuffix />
  );
}
