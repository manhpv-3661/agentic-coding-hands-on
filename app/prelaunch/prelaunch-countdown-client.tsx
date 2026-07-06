"use client";

import { useEventCountdown } from "@/hooks/use-event-countdown";
import { usePrelaunchAutoRedirect } from "@/hooks/use-prelaunch-auto-redirect";
import { PrelaunchContent, type PrelaunchCountdownContent } from "./components/prelaunch-content";

export interface PrelaunchCountdownClientProps {
  /** Locale-resolved heading + countdown labels, built by `page.tsx` and
   * forwarded straight into `PrelaunchContent` (serializable Server →
   * Client prop, safe to pass through the `<Suspense>` boundary). */
  content: PrelaunchCountdownContent;
}

/**
 * Live client wrapper for the Countdown - Prelaunch page: renders the real
 * `useEventCountdown()` values into `PrelaunchContent` and, once the
 * countdown reaches zero, hands off to `usePrelaunchAutoRedirect` to
 * navigate to the sanitized `?next=` target (see
 * `hooks/use-prelaunch-auto-redirect.ts`). Requires a `<Suspense>` ancestor
 * (see `page.tsx`) because the redirect hook reads `useSearchParams()`.
 */
export function PrelaunchCountdownClient({ content }: PrelaunchCountdownClientProps) {
  const { days, hours, minutes } = useEventCountdown();
  usePrelaunchAutoRedirect();

  return <PrelaunchContent days={days} hours={hours} minutes={minutes} content={content} />;
}
