"use client";

import { useEffect, useRef, useState } from "react";

export interface UseCarouselResult {
  /** Current active slide index, clamped to `[0, count - 1]`. */
  index: number;
  /** Advances one slide; no-op at the last slide. */
  next: () => void;
  /** Goes back one slide; no-op at the first slide. */
  prev: () => void;
  /** Jumps to an arbitrary slide, clamped to bounds. */
  goTo: (target: number) => void;
  /** Resets to slide 0. */
  reset: () => void;
  canPrev: boolean;
  canNext: boolean;
}

function clamp(value: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(Math.max(value, 0), count - 1);
}

/**
 * Custom carousel state — no library dependency (clarifications.md: no
 * carousel/word-cloud lib in `package.json`, YAGNI for 5 static slides).
 * Mirrors `hooks/use-scroll-spy.ts`'s plain state + content-key reset
 * idiom: the moment `count` changes (e.g. a filter narrows the Highlight
 * Kudos dataset, FR-16), the exposed index snaps back to slide 0
 * immediately rather than lingering on a stale, possibly out-of-range
 * index.
 */
export function useCarousel(count: number): UseCarouselResult {
  const [index, setIndex] = useState(0);
  const resolvedCountRef = useRef(count);
  const countChanged = count !== resolvedCountRef.current;

  // Avoid render-phase `setState` while still exposing the reset index
  // immediately on the render where `count` changes.
  const clampedIndex = countChanged ? 0 : clamp(index, count);

  useEffect(() => {
    if (!countChanged) return;
    resolvedCountRef.current = count;
    setIndex(0);
  }, [count, countChanged]);

  return {
    index: clampedIndex,
    next: () => setIndex((current) => clamp(current + 1, count)),
    prev: () => setIndex((current) => clamp(current - 1, count)),
    goTo: (target: number) => setIndex(clamp(target, count)),
    reset: () => setIndex(0),
    canPrev: clampedIndex > 0,
    canNext: clampedIndex < count - 1,
  };
}
