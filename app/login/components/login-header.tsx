import Image from "next/image";
import type { Locale } from "@/lib/i18n/locale";
import { LanguageSelector } from "./language-selector";

/**
 * Sticky header — brand logo (left) + language selector (right).
 * MoMorph node: `662:14391` (mms_A_Header).
 *
 * Solid 80%-opacity dark band (`rgba(11, 15, 18, 0.8)`) per the design's own
 * `backgroundColor` on this node — it spans the full header width, so the
 * language selector stays legible even past the page's hero scrim (which
 * fades to transparent at 25.41% of the frame width, well before the
 * selector's position).
 *
 * @param initialLocale - locale resolved server-side in page.tsx, forwarded
 *   straight to the (client) LanguageSelector so its trigger never flashes
 *   the wrong language on first paint.
 */
export function LoginHeader({ initialLocale }: { initialLocale: Locale }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-[rgba(11,15,18,0.8)] px-6 py-3 sm:px-10 lg:px-36">
      <Image
        src="/login/Logo.png"
        alt="Sun* Annual Awards 2025"
        width={52}
        height={48}
        priority
      />
      <LanguageSelector initialLocale={initialLocale} />
    </header>
  );
}
