import Image from "next/image";
import { LanguageSelector } from "./language-selector";

/**
 * Sticky header — brand logo (left) + language selector (right).
 * MoMorph node: `662:14391` (mms_A_Header).
 *
 * Background is intentionally transparent here: it sits over the page's hero
 * background (see page.tsx). The logo (left) is over the dark scrim and the
 * language selector (right) has its own hover surface, so both stay legible
 * over the wave art without a dedicated header band.
 */
export function LoginHeader() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 sm:px-10 lg:px-36">
      <Image
        src="/login/Logo.png"
        alt="Sun* Annual Awards 2025"
        width={52}
        height={48}
        priority
      />
      <LanguageSelector />
    </header>
  );
}
