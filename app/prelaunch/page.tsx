import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { montserrat } from "../login/fonts";
import { PrelaunchBackground } from "./components/prelaunch-background";
import { PrelaunchContent, type PrelaunchCountdownContent } from "./components/prelaunch-content";
import { PrelaunchCountdownClient } from "./prelaunch-countdown-client";

/**
 * Locale-aware `<title>`/description — replaces the static `export const
 * metadata` now that `prelaunch.meta.*` carries the per-locale copy (F005).
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);

  return {
    title: dictionary.prelaunch.meta.title,
    description: dictionary.prelaunch.meta.description,
  };
}

/**
 * Countdown - Prelaunch page (provisional F003).
 * MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU
 * (Figma node `2268:35127`, "Countdown - Prelaunch page").
 *
 * Site-wide navigation gate shown before `NEXT_PUBLIC_EVENT_START_AT` — every
 * route (including `/login`) redirects here until the countdown reaches
 * zero (time-gate lives in `proxy.ts`). `PrelaunchCountdownClient` reads the
 * live countdown and auto-navigates away via `?next=` once it hits zero
 * (`hooks/use-prelaunch-auto-redirect.ts`); it needs `useSearchParams()`, so
 * it's wrapped in `<Suspense>` with a static "00 00 00" SSR-safe fallback.
 *
 * `app/login/fonts.ts` is reused (not duplicated) for Montserrat, same
 * precedent as the homepage (`app/page.tsx`) and login screen.
 *
 * Async Server Component (F005): resolves the `NEXT_LOCALE` cookie and
 * builds the `content` slice once, then threads it into BOTH the
 * `<Suspense>` fallback and the live `PrelaunchCountdownClient` so SSR and
 * post-hydration renders never diverge on heading/label copy.
 */
export default async function PrelaunchPage() {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const content: PrelaunchCountdownContent = {
    heading: dictionary.prelaunch.countdown.heading,
    labels: dictionary.shared.countdown,
  };

  return (
    <div
      className={`${montserrat.variable} relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#00101A] px-6 py-12 lg:px-36 lg:py-24`}
    >
      <PrelaunchBackground />
      <Suspense
        fallback={<PrelaunchContent days="00" hours="00" minutes="00" content={content} />}
      >
        <PrelaunchCountdownClient content={content} />
      </Suspense>
    </div>
  );
}
