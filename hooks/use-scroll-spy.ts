"use client";

import { useEffect, useRef, useState } from "react";

export interface UseScrollSpyOptions {
  /** Passed through to `IntersectionObserver`. Defaults to a center band so
   * the section crossing viewport middle wins, avoiding two-active flicker. */
  rootMargin?: string;
  /** Passed through to `IntersectionObserver`. Defaults to 0. */
  threshold?: number;
}

const DEFAULT_ROOT_MARGIN = "-45% 0px -45% 0px";
const DEFAULT_THRESHOLD = 0;

/**
 * Generic scroll-spy: observes the DOM nodes matching `ids` (looked up via
 * `document.getElementById`) with a single `IntersectionObserver` and returns
 * whichever one is currently intersecting, preferring the id that appears
 * first in `ids` when more than one intersects at once (deterministic
 * tie-break — see FR-8/FR-10 in `spec/awards-page/feature.md`).
 *
 * Sections are expected to be rendered by a sibling component and may not
 * exist yet on first render, so missing ids are skipped rather than thrown
 * on (FR-10). If no id resolves to a node, no observer is created and
 * `activeId` stays `null`.
 */
export function useScrollSpy(
  ids: string[],
  options: UseScrollSpyOptions = {},
): string | null {
  const { rootMargin = DEFAULT_ROOT_MARGIN, threshold = DEFAULT_THRESHOLD } =
    options;
  const [activeId, setActiveId] = useState<string | null>(null);

  // `ids` is re-created on every render by most callers (array literal /
  // derived list), so joining into a stable string key is what actually
  // gates the effect below on *content* changes rather than identity
  // changes. The effect closes over `ids` itself (not the key) — that
  // closure is guaranteed fresh on the render where `idsKey` changed, which
  // is the only render that re-runs the effect.
  const idsKey = ids.join("|");
  const resolvedKeyRef = useRef(idsKey);
  const idsChanged = idsKey !== resolvedKeyRef.current;
  const visibleActiveId = idsChanged ? null : activeId;

  useEffect(() => {
    if (idsChanged) {
      resolvedKeyRef.current = idsKey;
      setActiveId(null);
    }

    if (typeof IntersectionObserver === "undefined") return undefined;

    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);

    if (nodes.length === 0) return undefined;

    const intersecting = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          intersecting.set(entry.target.id, entry.isIntersecting);
        }
        const next = ids.find((id) => intersecting.get(id) === true) ?? null;
        setActiveId(next);
      },
      { rootMargin, threshold },
    );

    for (const node of nodes) {
      observer.observe(node);
    }

    return () => {
      observer.disconnect();
      intersecting.clear();
    };
    // `ids` intentionally omitted: `idsKey` already encodes its content, and
    // depending on `ids` directly would re-run this effect on every render
    // (most callers pass a fresh array literal each time).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsChanged, idsKey, rootMargin, threshold]);

  return visibleActiveId;
}
