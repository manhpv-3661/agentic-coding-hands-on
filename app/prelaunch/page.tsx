import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { PageGutter } from "../components/layout/page-layout";
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

  // mm:2268:35131 ("Bìa") is an invisible (no-fill) layout wrapper with
  // absolute box startY:218/endY:673 and its own `padding: 96px 144px`
  // inside the 1512x1077 reference frame. The actual heading+countdown
  // content — mm:2268:35136 ("Countdown time") — sits at absolute
  // startY:314 (= Bìa's startY:218 + Bìa's own padding-top:96), so the true
  // top gap is 314px (~29.2% of frame height), not just Bìa's own 218px
  // offset. `lg:justify-start` + `lg:pt-[29.2vh]` reproduce that ratio
  // responsively (the remaining space naturally falls below via flex-start),
  // matching the `lg:` sizing this frame was designed at.
  return (
    <PageGutter
      className={`${montserrat.variable} relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#00101A] py-12 lg:justify-start lg:pt-[29.2vh] lg:pb-24`}
    >
      <PrelaunchBackground />
      <Suspense
        fallback={<PrelaunchContent days="00" hours="00" minutes="00" content={content} />}
      >
        <PrelaunchCountdownClient content={content} />
      </Suspense>
    </PageGutter>
  );
}
