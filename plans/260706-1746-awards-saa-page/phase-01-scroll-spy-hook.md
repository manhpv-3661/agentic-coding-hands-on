# Phase 01 — Scroll-spy hook (`use-scroll-spy`)

## Context Links
- Spec: `spec/awards-page/feature.md` FR-8, FR-10
- Clarification: Session 2026-07-06 — real IntersectionObserver
- Pattern refs: `hooks/use-dismissable-menu.ts` (listener attach/cleanup, `"use client"`), `hooks/use-prelaunch-auto-redirect.ts`
- Test pattern: `tests/unit/use-dismissable-menu.test.tsx`

## Overview
- **Priority:** P2 · **Status:** done
- Generic client hook: given an ordered array of section ids, observe each with
  a single `IntersectionObserver` and return the currently-active id. Drives the
  nav menu highlight (Phase 03/05). No coupling to awards specifics.

## Key Insights
- jsdom has NO `IntersectionObserver` — the unit test MUST install a mock/stub.
- Only ONE active at a time (FR-8). Invalid/absent id → no throw, no-op (FR-10).
- Sections are rendered by the catalog (Phase 05); the hook must not assume they
  exist at first render — query lazily inside the effect, skip missing nodes.

## Requirements
- **Functional:** accept `ids: string[]`, optional `{ rootMargin?, threshold? }`.
  Return `activeId: string | null`. On scroll, active = the intersecting section
  highest in the given `ids` order (deterministic tie-break); `null` until one
  intersects. Re-runs when `ids` change.
- **Non-functional:** single observer instance; full `disconnect()` on unmount /
  deps change; zero cost when `ids` empty; SSR-safe (effect only, guard
  `typeof IntersectionObserver`).

## Architecture
Data flow: `ids[]` → effect: `getElementById` per id (skip null) → one
`IntersectionObserver(cb, {rootMargin, threshold})` observes each node → cb
updates an internal `Map<id, ratio/isIntersecting>` → derive active (first id in
`ids` order that is intersecting) → `setActiveId`. Return `activeId`.
- Default `rootMargin: "-45% 0px -45% 0px"` (biases active toward the section
  crossing viewport center — avoids two-active flicker). Default `threshold: 0`.
- Store observer + map in refs; rebuild observer only when `ids` identity/content
  changes (join ids into a stable dep key).

## Related Code Files
- **Create:** `hooks/use-scroll-spy.ts` (<120 lines, `"use client"`)
- **Create:** `tests/unit/use-scroll-spy.test.tsx`
- **Read for context:** `hooks/use-dismissable-menu.ts`

## Implementation Steps
1. `"use client"`; `useState<string | null>(null)`, `useRef` for observer + entry map.
2. `useEffect` keyed on `ids.join("|")`: guard `typeof IntersectionObserver === "undefined"` → return. Map ids → nodes via `document.getElementById`, filter nulls.
3. If no nodes → `setActiveId(null)`, return (no observer). (FR-10 graceful.)
4. Create observer; in callback update entry map for each `entry.target.id`, then compute active = first id in `ids` whose entry `isIntersecting` (fallback: max `intersectionRatio`); `setActiveId`.
5. Observe each node. Cleanup: `observer.disconnect()`, clear map.
6. Return `activeId`.

## Todo List
- [x] Implement `hooks/use-scroll-spy.ts`
- [x] Unit test: mock `IntersectionObserver` (capture callback), simulate entries → assert single active, order-based tie-break
- [x] Unit test: empty ids → `null`, no observer constructed
- [x] Unit test: missing DOM node id skipped, no throw (FR-10)
- [x] Unit test: `disconnect` called on unmount
- [x] `npx tsc --noEmit` + `npx vitest run tests/unit/use-scroll-spy.test.tsx`

## Success Criteria
- Returns exactly one active id (or null) at any time; changes as mocked entries change.
- No throw on empty/invalid ids. `disconnect` verified on unmount.
- Type-checks; test green.

## Risk Assessment
- **IO mock fidelity (Med/Med):** jsdom stub must let the test invoke the observer callback with synthetic entries → capture the constructor callback in the mock. Mitigation: `vi.stubGlobal("IntersectionObserver", class { constructor(cb){...} observe(){} disconnect(){} })` storing `cb`.
- **Two-active flicker (Low/Low):** mitigated by `rootMargin` center-band + order tie-break.

## Security Considerations
- None (pure client observation, no user input, no DOM writes).

## Next Steps
- Consumed by Phase 05 (`awards-catalog.tsx`). Nav menu (Phase 03) receives the
  resulting `activeSlug` as a prop — no direct hook dependency.
</content>
