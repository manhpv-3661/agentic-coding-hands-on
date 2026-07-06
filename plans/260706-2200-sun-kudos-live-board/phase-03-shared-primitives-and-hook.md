---
feature: F006
phase: 03
title: Shared primitives and carousel hook
status: done
---

# Phase 03 — Shared primitives + carousel hook

## Context Links
- Spec: FR-6/FR-13 (avatars, copy link, view detail), FR-7 (carousel nav), FR-13 (gallery).
- Clarifications: avatars = initials-in-colored-circle (no photo assets); gallery = generic
  placeholder tiles (no real images); Copy Link = real `navigator.clipboard` + local toast;
  carousel = custom hook (no lib), mirror `hooks/use-scroll-spy.ts` plain state+effect style.
- Pattern refs: `hooks/use-scroll-spy.ts` (hook + content-key reset idiom),
  `app/components/home/award-card.tsx` (inline `currentColor` SVG icon idiom).

## Overview
- **Priority:** P1 (card + sections depend on these) · **Status:** pending
- Small, reusable, dependency-free building blocks. All four component files are pure
  presentational EXCEPT `copy-link-button` (client) and `use-carousel` (client hook).

## Key Insights
- Deterministic avatar color: hash the name → pick from a fixed palette so the same person
  always gets the same color (no randomness → stable snapshot/tests, no hydration mismatch).
- Copy Link toast is self-contained inside `copy-link-button.tsx` (local `useState` +
  `setTimeout` auto-dismiss) — do NOT build a global toast system (YAGNI).
- `use-carousel` must RESET to index 0 when item count changes (FR-16: filter change resets
  carousel to slide 1) — reuse the content-key reset trick from `use-scroll-spy.ts`.
- Section heading ("Sun* Annual Awards 2025" subtitle + gold title) repeats 3× (Highlight,
  Spotlight, All Kudos) → extract to avoid duplication (DRY).

## Requirements
- **Avatar (FR-6/13/20):** initials from name (1–2 chars), colored circle, `size` prop,
  accessible (`aria-label` or alt = full name). Static info, NO link/onClick (profile routing
  out of scope). Pure presentational.
- **Copy Link (FR-13, real):** button that writes a link string to clipboard + shows a
  transient toast (`kudos.card.copied`). Client. Graceful when clipboard API absent.
- **Image gallery (FR-13):** renders up to 5 placeholder tiles (icon + muted bg) from an
  `count`/`items` prop; renders nothing when count is 0. Pure presentational.
- **Section heading (FR-5/9/12):** `{ subtitle, title }`, subtitle hardcoded literal by
  callers ("Sun* Annual Awards 2025"), title is the English design label. Pure presentational.
- **use-carousel (FR-7):** `useCarousel(count)` → `{ index, next, prev, goTo, reset, canPrev,
  canNext }`; clamps at bounds (disable arrows at ends); resets on `count` change.
- **NFR-2/NFR-4:** each file <200 lines; no new dependency.

## Architecture / client-server boundary
| File | Boundary | Notes |
|------|----------|-------|
| `app/components/kudos/avatar.tsx` | presentational (no directive) | initials + hashed color |
| `app/components/kudos/copy-link-button.tsx` | **`"use client"`** | clipboard + local toast state |
| `app/components/kudos/kudos-image-gallery.tsx` | presentational | placeholder tiles |
| `app/components/kudos/kudos-section-heading.tsx` | presentational | subtitle + gold title |
| `hooks/use-carousel.ts` | **`"use client"`** | index state, bound clamping, count-reset |

## Related Code Files
- **Create:** `app/components/kudos/avatar.tsx` (+ `avatar.test.tsx`)
- **Create:** `app/components/kudos/copy-link-button.tsx` (+ `copy-link-button.test.tsx`)
- **Create:** `app/components/kudos/kudos-image-gallery.tsx` (+ `kudos-image-gallery.test.tsx`)
- **Create:** `app/components/kudos/kudos-section-heading.tsx` (+ test)
- **Create:** `hooks/use-carousel.ts` (+ `hooks/use-carousel.test.tsx` OR `tests/unit/use-carousel.test.tsx` — mirror `use-scroll-spy.test.tsx` location)
- **Read for context:** `hooks/use-scroll-spy.ts`, `hooks/use-scroll-spy.test.tsx`, `app/components/home/award-card.tsx`

## Implementation Steps
1. `avatar.tsx`: `initials(name)` helper (first letters of up to 2 words), `colorFor(name)`
   (sum char codes % palette length), circle with `aria-label={name}`.
2. `copy-link-button.tsx`: `"use client"`; `onCopy` → `navigator.clipboard.writeText(link)`,
   set `copied` true, `setTimeout` clear ~2s; render button + toast (label props). Guard
   missing clipboard (try/catch, no throw).
3. `kudos-image-gallery.tsx`: map `Array.from({length: min(count,5)})` → placeholder tiles;
   return `null` when 0.
4. `kudos-section-heading.tsx`: subtitle `<p>` + divider + gold `<h2>` (page has the `h1`
   context via banner; use `h2` for section titles).
5. `use-carousel.ts`: `"use client"`; `useState(0)`; `next/prev/goTo` clamp `[0,count-1]`;
   reset index when `count` changes (content-key pattern from `use-scroll-spy.ts`).

## Todo List
- [x] `avatar.tsx` + test (initials, deterministic color, aria-label, no link)
- [x] `copy-link-button.tsx` + test (clipboard called, toast appears then clears; missing-API safe)
- [x] `kudos-image-gallery.tsx` + test (renders n tiles capped at 5; null at 0)
- [x] `kudos-section-heading.tsx` + test (subtitle + title render)
- [x] `use-carousel.ts` + test (clamps ends, canPrev/canNext, resets on count change)
- [x] `npx tsc --noEmit` + vitest run

## Success Criteria
- All files <200 lines, compile clean, tests green.
- Avatar color deterministic (same name → same color).
- Copy Link calls clipboard + shows/clears toast; no throw when API missing.
- Carousel clamps at both ends and resets on count change.

## Risk Assessment
- **Hydration mismatch from non-deterministic color (Med/Med):** use a pure hash, no
  `Math.random`/`Date`. **Countermove:** test asserts stable color for a fixed name.
- **Clipboard unavailable in test/jsdom (Med/Low):** wrap in try/catch; test mocks
  `navigator.clipboard.writeText`.

## Security Considerations
- Copy Link writes a static in-app link string only — no user data, no secrets.

## Next Steps
- Phase 04 (card) uses avatar, gallery, copy-link; Phase 05 uses use-carousel + section-heading;
  Phases 06/07 use section-heading + avatar.
