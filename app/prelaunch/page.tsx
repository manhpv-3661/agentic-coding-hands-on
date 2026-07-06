import type { Metadata } from "next";
import { Suspense } from "react";
import { montserrat } from "../login/fonts";
import { PrelaunchBackground } from "./components/prelaunch-background";
import { PrelaunchContent } from "./components/prelaunch-content";
import { PrelaunchCountdownClient } from "./prelaunch-countdown-client";

export const metadata: Metadata = {
  title: "Sự kiện sắp bắt đầu — Sun* Annual Awards 2025",
  description: "Countdown - Prelaunch page — Sun* Annual Awards 2025.",
};

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
 */
export default function PrelaunchPage() {
  return (
    <div
      className={`${montserrat.variable} relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#00101A] px-6 py-12 lg:px-36 lg:py-24`}
    >
      <PrelaunchBackground />
      <Suspense fallback={<PrelaunchContent days="00" hours="00" minutes="00" />}>
        <PrelaunchCountdownClient />
      </Suspense>
    </div>
  );
}
