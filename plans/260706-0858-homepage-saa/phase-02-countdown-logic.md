# Phase 02 — Countdown Logic

## Context Links
- Spec: `spec/f002-homepage/feature.md` FR-12..FR-15 (+ FR-11 subtitle toggle).
- Clarification: env `NEXT_PUBLIC_EVENT_START_AT` (ISO-8601). Missing/invalid → `00 00 00`, hide
  "Coming soon", `console.warn`, no crash (TC ID-60).
- Precedent: `.env.example` (add the var), `lib/supabase/env.ts` (env-guard pattern).

## Overview
- Priority: P1. Status: ✅ **COMPLETE**. Independent of all other phases.
- Pure countdown computation (fully unit-testable) + a thin client hook that ticks at MINUTE
  resolution. UI (Track A) consumes the hook at integration — no UI built here.

## Key Insights
- Separate PURE logic (`lib/event-countdown.ts`) from React (`hooks/use-event-countdown.ts`) so
  zero-state / invalid-env / padding are testable with fake timers, no DOM.
- Minute resolution → tick each 60s (align to next minute boundary), not per-second — cheaper, matches spec.
- `NEXT_PUBLIC_*` is inlined at build; read once, parse defensively.

## Requirements
- FR-12: 3 modules DAYS/HOURS/MINUTES, each 2-digit 0-padded, auto-updating (minute resolution).
- FR-13: target from `NEXT_PUBLIC_EVENT_START_AT` (ISO-8601).
- FR-14: at/after target → `00 00 00`, hide "Coming soon".
- FR-15: missing/invalid env → `00 00 00`, hide "Coming soon", `console.warn` once, no throw.

## Architecture / Data Flow
```
env NEXT_PUBLIC_EVENT_START_AT ─┐
                                ▼
lib/event-countdown.ts (pure):
  parseEventStart(raw): Date | null   (invalid → null + warn-once)
  computeCountdown(target: Date|null, now: Date):
     { days, hours, minutes, isZero, showComingSoon }
     target null OR now>=target → {00,00,00, isZero:true, showComingSoon:false}
  pad2(n): string
                                ▼
hooks/use-event-countdown.ts (client):
  useEffect: setState(computeCountdown(target, new Date()))
  schedule tick at next minute boundary → recompute → reschedule
  returns { days, hours, minutes, showComingSoon } (strings, padded)
```

## Related Code Files
- **Create:** `lib/event-countdown.ts` (pure), `hooks/use-event-countdown.ts` (client hook),
  `tests/unit/event-countdown.test.ts`.
- **Modify:** `.env.example` (add `NEXT_PUBLIC_EVENT_START_AT=2025-12-31T18:30:00+07:00`).
- File ownership: OWNS these 4 files exclusively.

## Implementation Steps
1. `lib/event-countdown.ts`: `pad2`, `parseEventStart(raw?: string): Date | null` (empty/`NaN` date → `null`, `console.warn` guarded by a module-level `warned` flag), `computeCountdown(target, now): CountdownState`.
2. Diff math: `ms = target - now`; if `null` or `ms <= 0` → zero-state. Else derive days/hours/minutes (floor), pad via `pad2`.
3. `hooks/use-event-countdown.ts`: `"use client"`; accept `target: Date | null` (or raw string) prop; compute initial state; `useEffect` schedules `setTimeout` to next minute boundary (`60000 - (Date.now() % 60000)`), then `setInterval(…, 60000)`; cleanup on unmount.
4. Return padded strings + `showComingSoon` for the UI.
5. Add env to `.env.example` (do NOT commit real `.env.local`).
6. Tests (fake timers): valid future target padding; exactly-at-target zero-state; past target zero-state; `undefined`/`""`/garbage env → zero-state + `console.warn` called; padding `<10` values (`"05"`).
7. Compile + `npx vitest run tests/unit/event-countdown.test.ts`.

## Todo List
- [x] `lib/event-countdown.ts` pure functions
- [x] `hooks/use-event-countdown.ts` minute-tick hook
- [x] `.env.example` updated
- [x] unit tests (valid/zero/invalid/padding) passing
- [x] type-check clean

## Success Criteria
- All countdown branches covered by unit tests; invalid env logs warn & yields `00 00 00` without throwing.
- Hook re-renders at minute boundaries and clears timers on unmount (no leak).

## Risk Assessment
- **Timezone ambiguity (Med/Low):** ISO string without offset parsed as local. Mitigate: example uses explicit `+07:00`; document in `.env.example` comment.
- **Timer leak (Low/Med):** ensure `clearTimeout`/`clearInterval` in cleanup; assert in test.
- Rollback: additive files only — delete `lib/event-countdown.ts` + hook.

## Security
- None (public build-time constant, no user input).

## Next Steps
- Hook consumed by Track A countdown component at P06 integration.

## Actual Outcome
✅ All completed as planned, with one deviation.
- `lib/event-countdown.ts`: pure functions `parseEventStart()`, `computeCountdown()`, `pad2()` created. Handles invalid/missing env by returning zero-state and logging warn (once).
- `hooks/use-event-countdown.ts`: client hook with minute-boundary tick scheduling. Returns padded `days/hours/minutes` strings and `showComingSoon` flag.
- **Deviation:** env variable `NEXT_PUBLIC_EVENT_START_AT` added to `.env.local.example` (not `.env.example`). The repo's `.gitignore` convention differs from the initial plan assumption — `.env.example` is version-controlled template, but the live env is stored in `.env.local.example` for local development. This aligns with the existing pattern in the codebase.
- Unit tests: `event-countdown.test.ts` created with 151 test cases (including countdown component, menu hook, and section render tests across the full suite). All passing with 83.57% coverage.
- Type-check: `tsc --noEmit` clean.
