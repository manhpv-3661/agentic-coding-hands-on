import { Montserrat, Montserrat_Alternates } from "next/font/google";
import localFont from "next/font/local";

/**
 * Canonical brand-font module for the whole app (not just /login).
 *
 * `montserrat` is the site-wide default body font (wired via `--font-sans`
 * in `app/globals.css`, applied on `<html>` in `app/layout.tsx`).
 * `montserratAlternates` is the bold accent face used for a handful of
 * headings — its subsets include `"vietnamese"` because the site is
 * bilingual (VI/EN) and VN copy renders in this face (e.g. the login
 * footer).
 *
 * `digitalNumbers` backs the countdown digit glyphs (FR-F5). Figma declares
 * `fontFamily: "Digital Numbers"` on those nodes; that family exists in the
 * `google/fonts` OFL source repo (`ofl/digitalnumbers`) but isn't published
 * to the live Google Fonts API, so it's self-hosted via `next/font/local`
 * from the same upstream `.ttf` (SIL OFL 1.1) — see
 * `app/fonts/digital-numbers/OFL.txt` for the license.
 */
export const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  variable: "--font-montserrat-alternates",
  display: "swap",
});

export const digitalNumbers = localFont({
  src: "./fonts/digital-numbers/DigitalNumbers-Regular.ttf",
  weight: "400",
  variable: "--font-digital-numbers",
  display: "swap",
});
