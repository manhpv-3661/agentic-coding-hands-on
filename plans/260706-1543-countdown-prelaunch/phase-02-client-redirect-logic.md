# Phase 02 — Client auto-unlock logic (Track B)

## Context Links
- `spec/countdown-prelaunch/technical-spec.md` — FR-007, BR-002
- `spec/countdown-prelaunch/edge-cases.md` — open-redirect row, env-missing row
- `hooks/use-event-countdown.ts` — reuse unmodified (source of the zero signal)
- `lib/event-countdown.ts` — `CountdownState` semantics
- `app/auth/callback/route.ts` — existing `?next=` sanitize pattern to mirror

## Overview
- **Priority:** P0
- **Status:** done
- **Track:** B — parallel-runnable. Produces pure + client logic with **no import of Track A files**,
  so it can be built and unit-tested before Track A finishes.
- Delivers: an open-redirect-safe path sanitizer + a client hook that navigates to `?next=` the
  moment the countdown reaches zero.

## Key Insights
- `useEventCountdown()` returns `{ days, hours, minutes, showComingSoon }` — it does **not** expose
  `isZero`. But in `lib/event-countdown.ts`, `showComingSoon` is `true` only in the future branch and
  `false` in `ZERO_STATE`; therefore **`isZero === !showComingSoon` by construction**. Derive the
  "reached zero" signal as `!showComingSoon`. This avoids modifying the hook (constraint: reuse
  unmodified). Document the equivalence in a code comment so it reads as intentional, not a hack.
- Minute-resolution tick: after launch the redirect may fire up to ~60s late. Accepted per the
  "minute resolution" clarification.
- Env missing/invalid → `showComingSoon` false from first render → redirect fires immediately to
  the fallback (matches the env-missing edge case).

## Requirements
- FR-007: at `isZero` while on `/prelaunch`, auto-navigate (client) to `?next=` (or `/`).
- BR-002: `?next=` accepted only if internal path (`startsWith("/")`, not `//`), else `/`.

## Architecture

### `lib/safe-redirect.ts` (pure, no React)
```ts
/** Accept only same-origin relative paths; reject absolute/external (open-redirect guard). */
export function sanitizeInternalPath(raw: string | null | undefined): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
}
```
- Mirrors the guard already inline in `app/auth/callback/route.ts`. Kept as a shared, unit-testable
  helper for the new code. (Consolidating the callback's inline copy to use this is OPTIONAL future
  DRY cleanup — out of scope here, do not touch the callback route.)

### `hooks/use-prelaunch-auto-redirect.ts` (client hook)
```
"use client"
useEventCountdown() → { showComingSoon }
searchParams = useSearchParams(); target = sanitizeInternalPath(searchParams.get("next"))
router = useRouter()
useEffect(() => { if (!showComingSoon) router.replace(target) }, [showComingSoon, target, router])
```
- `router.replace` (not `push`) so back-button doesn't return to `/prelaunch`.
- `useSearchParams` requires a Suspense boundary at the page level (handled in Phase 03).
- Uses `next/navigation` (`useRouter`, `useSearchParams`).

### Data flow
```
URL ?next=/awards → useSearchParams → sanitizeInternalPath → "/awards"
countdown ticks → showComingSoon flips false → effect → router.replace("/awards")
→ proxy time-gate now inactive (post-zero) → auth-gate decides final destination
```

## Related Code Files
- **Create:** `lib/safe-redirect.ts` (~10 lines)
- **Create:** `hooks/use-prelaunch-auto-redirect.ts` (~25 lines)
- **Do NOT modify:** `hooks/use-event-countdown.ts`, `lib/event-countdown.ts`,
  `app/auth/callback/route.ts`.

## Implementation Steps
1. Create `lib/safe-redirect.ts` with `sanitizeInternalPath`.
2. Create `hooks/use-prelaunch-auto-redirect.ts`: consume `useEventCountdown`, `useSearchParams`,
   `useRouter`; derive `!showComingSoon`; effect calls `router.replace(sanitizedNext)`.
3. Comment the `isZero === !showComingSoon` equivalence at the derivation site.
4. `npx tsc --noEmit` — confirm no compile errors.

## Todo List
- [x] `lib/safe-redirect.ts` with open-redirect guard
- [x] `hooks/use-prelaunch-auto-redirect.ts` using hook + searchParams + router.replace
- [x] Derive zero-signal from `showComingSoon`, comment the equivalence
- [x] Typecheck passes

## Success Criteria
- `sanitizeInternalPath`: `/awards`→`/awards`; `//evil`→`/`; `https://evil`→`/`; ``/null→`/`.
- Hook navigates to sanitized `?next=` exactly when `showComingSoon` becomes false; no navigation while true.

## Risk Assessment
| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| `showComingSoon` semantics drift from `!isZero` in a future edit | Low | Med | Comment the invariant; Phase 04 unit test asserts redirect fires on zero-state |
| `useSearchParams` without Suspense → build/prerender error | Med | Med | Phase 03 wraps the client component in `<Suspense>` |
| Redirect fires before hydration / during SSR | Low | Low | Logic is in `useEffect` (client-only); safe |

## Security Considerations
- Open-redirect protection is the core security concern — enforced by `sanitizeInternalPath`.
- Client redirect is convenience only; the server proxy (Phase 01) is the real gate.

## Next Steps
- Phase 03 composes this hook + Track A's display into the client component and page, adding Suspense.
