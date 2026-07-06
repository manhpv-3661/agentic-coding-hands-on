"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeCountdown,
  parseEventStart,
  type CountdownState,
} from "@/lib/event-countdown";

const MINUTE_MS = 60_000;

export type UseEventCountdownResult = Pick<
  CountdownState,
  "days" | "hours" | "minutes" | "showComingSoon"
>;

/**
 * Client hook driving the homepage countdown (FR-12..FR-15).
 * Ticks at minute resolution, aligned to the next minute boundary, and
 * recomputes from `computeCountdown` (see `lib/event-countdown.ts`).
 *
 * @param eventStartAt ISO-8601 string, a `Date`, or `null`/`undefined`.
 *   Defaults to `process.env.NEXT_PUBLIC_EVENT_START_AT` so the literal
 *   env-var expression stays inlineable at build time.
 */
export function useEventCountdown(
  eventStartAt: string | Date | null | undefined = process.env
    .NEXT_PUBLIC_EVENT_START_AT,
): UseEventCountdownResult {
  const target = useMemo<Date | null>(() => {
    if (eventStartAt instanceof Date) return eventStartAt;
    return parseEventStart(eventStartAt ?? undefined);
  }, [eventStartAt]);

  const [state, setState] = useState<CountdownState>(() =>
    computeCountdown(target, new Date()),
  );

  // Resync immediately when `target` changes, without waiting for the next
  // timer tick. This runs during render (guarded by the `resyncedTarget`
  // comparison so it only fires once per target change) rather than inside
  // the effect below — the React-documented pattern for "adjusting state
  // when a prop changes" — so it doesn't trip `react-hooks/set-state-in-effect`,
  // which flags unconditional `setState` calls at the top of an effect body.
  const [resyncedTarget, setResyncedTarget] = useState(target);
  if (target !== resyncedTarget) {
    setResyncedTarget(target);
    setState(computeCountdown(target, new Date()));
  }

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const msUntilNextMinute = MINUTE_MS - (Date.now() % MINUTE_MS);
    const timeoutId = setTimeout(() => {
      setState(computeCountdown(target, new Date()));
      intervalId = setInterval(() => {
        setState(computeCountdown(target, new Date()));
      }, MINUTE_MS);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, [target]);

  return {
    days: state.days,
    hours: state.hours,
    minutes: state.minutes,
    showComingSoon: state.showComingSoon,
  };
}
