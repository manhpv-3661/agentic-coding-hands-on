"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEventCountdown } from "@/hooks/use-event-countdown";
import { sanitizeInternalPath } from "@/lib/safe-redirect";

/**
 * Fires the moment the prelaunch countdown reaches zero: navigates away from
 * `/prelaunch` to the sanitized `?next=` target (or `/` as fallback).
 *
 * `useEventCountdown` exposes `showComingSoon`, not `isZero` — but per
 * `lib/event-countdown.ts`, `showComingSoon` is `true` only on the "counting
 * down" branch and `false` in the zero state, so `isZero === !showComingSoon`
 * by construction. Deriving the signal this way avoids touching the
 * (deliberately unmodified) shared countdown hook.
 */
export function usePrelaunchAutoRedirect(): void {
  const { showComingSoon } = useEventCountdown();
  const searchParams = useSearchParams();
  const router = useRouter();
  const target = sanitizeInternalPath(searchParams.get("next"));

  useEffect(() => {
    if (!showComingSoon) {
      router.replace(target);
    }
  }, [showComingSoon, target, router]);
}
