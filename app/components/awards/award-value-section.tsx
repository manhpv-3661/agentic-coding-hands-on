import type { AwardMetric, AwardValueVariant } from "./award-detail-card";

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
 * value figure 313:8495, suffix 313:8497).
 */
function ValueVariantBlock({
  valueLabel,
  variant,
}: {
  valueLabel: string;
  variant: AwardValueVariant;
}) {
  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="flex items-center gap-4">
        <img
          src="/awards-saa/Icon-License.svg"
          alt=""
          aria-hidden="true"
          className="h-6 w-6 shrink-0"
        />
        <span className="font-montserrat text-[24px] leading-[32px] font-bold text-[#FFEA9E]">
          {valueLabel}
        </span>
      </div>
      <p className="font-montserrat text-[36px] leading-[44px] font-bold text-white">
        {variant.value}
      </p>
      <p className="font-montserrat text-[14px] leading-[20px] font-bold tracking-[0.1px] text-white">
        {variant.suffix}
      </p>
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
        <ValueVariantBlock valueLabel={valueLabel} variant={valueVariants.individual} />
        <div className="flex w-full items-center gap-2">
          <span className="font-montserrat text-[14px] leading-[20px] font-bold text-[#2E3940]">
            {valueVariants.orLabel}
          </span>
          <div className="h-px flex-1 bg-[#2E3940]" />
        </div>
        <ValueVariantBlock valueLabel={valueLabel} variant={valueVariants.collective} />
      </div>
    );
  }

  // `value` is only optional in the type because it's mutually exclusive
  // with `valueVariants`; by the time we reach this branch (no
  // `valueVariants`), the data model guarantees it's set (`award-detail-data.ts`
  // always supplies one or the other). Empty fallback is defensive only.
  const { number, unit } = value ?? { number: "", unit: "" };

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="flex items-center gap-4">
        <img
          src="/awards-saa/Icon-License.svg"
          alt=""
          aria-hidden="true"
          className="h-6 w-6 shrink-0"
        />
        <span className="font-montserrat text-[24px] leading-[32px] font-bold text-[#FFEA9E]">
          {valueLabel}
        </span>
      </div>
      <p className="font-montserrat text-[36px] leading-[44px] font-bold text-white">{number}</p>
      {unit && (
        <p className="font-montserrat text-[14px] leading-[20px] font-bold tracking-[0.1px] text-white">
          {unit}
        </p>
      )}
    </div>
  );
}
