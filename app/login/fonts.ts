import { Montserrat, Montserrat_Alternates } from "next/font/google";

/**
 * Fonts required by the Figma design for the Login screen only.
 * Scoped here (not in the root layout) to keep this UI-only screen
 * self-contained per file-ownership rules.
 */
export const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-montserrat-alternates",
  display: "swap",
});
