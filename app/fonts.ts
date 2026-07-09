import localFont from "next/font/local";

/**
 * Canonical brand-font module for the whole app (not just /login).
 *
 * `montserrat` / `montserratAlternates` are intentionally modeled as local
 * fallback stacks instead of `next/font/google`: this execution environment
 * blocks outbound fetches during `next build`, which makes Google-font
 * loaders fail the production build. The exported shape mirrors the subset
 * of `next/font/*` objects the app actually uses (`className` + `variable`)
 * so the rest of the code can keep importing from one canonical place.
 *
 * `digitalNumbers` backs the countdown digit glyphs (FR-F5). Figma declares
 * `fontFamily: "Digital Numbers"` on those nodes; that family exists in the
 * `google/fonts` OFL source repo (`ofl/digitalnumbers`) but isn't published
 * to the live Google Fonts API, so it's self-hosted via `next/font/local`
 * from the same upstream `.ttf` (SIL OFL 1.1) — see
 * `app/fonts/digital-numbers/OFL.txt` for the license.
 */
export const montserrat = {
  className: "font-montserrat",
  variable: "font-montserrat-variable",
} as const;

export const montserratAlternates = {
  className: "font-montserrat-alternates",
  variable: "font-montserrat-alternates-variable",
} as const;

export const digitalNumbers = localFont({
  src: "./fonts/digital-numbers/DigitalNumbers-Regular.ttf",
  weight: "400",
  variable: "--font-digital-numbers",
  display: "swap",
});
