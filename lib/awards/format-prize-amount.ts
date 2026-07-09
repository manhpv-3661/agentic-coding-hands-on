import type { Locale } from "@/lib/i18n/locale";

/**
 * Locale-aware formatters for the numeric award data that now lives in
 * `award_categories` (`quantity_number`, `*_amount_vnd`). Split out from
 * `award-detail-data.ts` so the homepage award grid (phase-04) can reuse
 * `formatVnd` instead of re-deriving the same display string twice.
 */

/** VNĐ/VND currency-unit suffix per locale, matching the exact strings the
 * dictionary previously hardcoded (e.g. "7.000.000 VNĐ" / "7,000,000 VND"). */
const CURRENCY_SUFFIX: Record<Locale, string> = {
  vi: "VNĐ",
  en: "VND",
};

/** BCP-47 tag `Intl.NumberFormat` uses for each locale's thousands
 * grouping — `vi-VN` groups with `.`, `en-US` groups with `,`. */
const INTL_LOCALE_TAG: Record<Locale, string> = {
  vi: "vi-VN",
  en: "en-US",
};

/**
 * Formats a plain VNĐ integer amount (as stored in `award_categories`'s
 * `value_amount_vnd` / `individual_amount_vnd` / `collective_amount_vnd`
 * columns) into the locale-specific display string the awards page has
 * always shown, e.g. `formatVnd(7000000, "en")` → `"7,000,000 VND"`,
 * `formatVnd(7000000, "vi")` → `"7.000.000 VNĐ"`.
 */
export function formatVnd(amountVnd: number, locale: Locale): string {
  const grouped = new Intl.NumberFormat(INTL_LOCALE_TAG[locale]).format(amountVnd);
  return `${grouped} ${CURRENCY_SUFFIX[locale]}`;
}

/**
 * Formats a plain award-quantity integer (`quantity_number` column) into
 * the two-digit, zero-padded display the design has always used for
 * counts under 10 (e.g. `1` → `"01"`), leaving double-digit counts (e.g.
 * `10`) unpadded — matches every existing dictionary entry verbatim and is
 * locale-independent (a bare digit string, no grouping).
 */
export function formatAwardQuantity(quantityNumber: number): string {
  return String(quantityNumber).padStart(2, "0");
}
