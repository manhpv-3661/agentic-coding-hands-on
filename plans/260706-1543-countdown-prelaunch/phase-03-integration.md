# Phase 03 — Integration: /prelaunch page wiring (Track A + B merge)

## Context Links
- Phase 01 (proxy time-gate), Phase 02 (auto-unlock hook + sanitizer)
- `spec/countdown-prelaunch/screens.md` — screen layout + journey
- `spec/countdown-prelaunch/technical-spec.md` — FR-002/003/004 (Track A UI), FR-007 (wiring)
- Track A output: `app/prelaunch/components/*` (presentational)
- `app/components/home/countdown-timer.tsx` — cross-reference only (different screen, do NOT reuse verbatim)

## Overview
- **Priority:** P0
- **Status:** done
- **Track:** merge point. **Depends on Phase 01, Phase 02, AND Track A completion.** This is the
  ONLY phase that touches both tracks' outputs. There is no other blocking merge point.
- Assembles the final `/prelaunch` route: Track A's static visuals + Track B's live countdown +
  auto-unlock.

## Key Insights
- `app/prelaunch/page.tsx` is authored HERE (owned by this phase), replacing any throwaway mock
  scaffold Track A produced. This prevents parallel file-ownership collisions.
- The page is a **server component**; the live/interactive parts live in a `"use client"` wrapper so
  `useEventCountdown`, `useSearchParams`, and the redirect effect run client-side.
- `useSearchParams` mandates a `<Suspense>` boundary — add it in the page.

## Integration Contract (Track A ⇄ Track B)
Track A MUST deliver a presentational countdown-display component with this interface:
```ts
// app/prelaunch/components/prelaunch-countdown-display.tsx  (Track A owns)
interface PrelaunchCountdownDisplayProps { days: string; hours: string; minutes: string }
```
- Plus static, prop-less visuals (background, title "Sự kiện sẽ bắt đầu sau"). Track A may name/split
  these freely under `app/prelaunch/components/`; the display component's prop shape above is the
  contract Track B binds to.
- Track A uses Figma mock values (e.g. days="12") only inside its throwaway `page.tsx` scaffold.
- Track B supplies live `days/hours/minutes` (from `useEventCountdown`) and the auto-unlock effect.
- If Track A's actual export name/path differs, adjust the import in the client wrapper only — the
  prop shape must not change without notifying this phase.

## Architecture

### `app/prelaunch/prelaunch-countdown-client.tsx` (Track B, client)
```
"use client"
useEventCountdown() → { days, hours, minutes }
usePrelaunchAutoRedirect()            // Phase 02 hook — fires the redirect
render <PrelaunchCountdownDisplay days hours minutes />   // Track A component
```

### `app/prelaunch/page.tsx` (server, this phase)
```
render:
  <PrelaunchBackground/>                 // Track A
  <PrelaunchTitle/>                      // Track A
  <Suspense fallback={<PrelaunchCountdownDisplay days="00" hours="00" minutes="00"/>}>
    <PrelaunchCountdownClient/>          // Track B wrapper
  </Suspense>
```
- Static SSR-safe fallback keeps first paint correct before hydration; the client wrapper takes over
  ticking + redirect. (Env is read inside the hook via `NEXT_PUBLIC_EVENT_START_AT`, inlined at build.)

### Data flow
```
proxy redirect → /prelaunch?next=/awards → page (server) renders visuals + Suspense
→ client wrapper mounts → useEventCountdown ticks days/hours/minutes into Track A display
→ on zero: usePrelaunchAutoRedirect → router.replace("/awards") → auth-gate takes over
```

## Related Code Files
- **Create:** `app/prelaunch/page.tsx` (server, ~30 lines) — owned by this phase.
- **Create:** `app/prelaunch/prelaunch-countdown-client.tsx` (client wrapper, ~25 lines).
- **Consume (Track A, do not edit here beyond import wiring needs):** `app/prelaunch/components/*`.
- **Consume:** `hooks/use-prelaunch-auto-redirect.ts`, `hooks/use-event-countdown.ts`.
- **Delete/replace:** Track A's throwaway mock `page.tsx` scaffold.

## Implementation Steps
1. Confirm Track A delivered `prelaunch-countdown-display` (or equivalent) matching the prop contract;
   note actual export name/path.
2. Create `prelaunch-countdown-client.tsx`: call `useEventCountdown` + `usePrelaunchAutoRedirect`,
   render Track A display with live values.
3. Author final `app/prelaunch/page.tsx`: compose Track A visuals + `<Suspense>` + client wrapper.
   Add page `metadata` (title) consistent with F002 pattern.
4. Remove the throwaway scaffold if a separate file.
5. `npx tsc --noEmit` + `npm run build` (or repo build) — confirm no Suspense/prerender errors.
6. Manual smoke: env future → `/` redirects to `/prelaunch`, digits render; env past → `/prelaunch`
   auto-redirects to `?next=`.

## Todo List
- [x] Verify Track A display component + prop contract
- [x] Create `prelaunch-countdown-client.tsx` wiring hook + display
- [x] Author final `app/prelaunch/page.tsx` with Suspense + metadata
- [x] Remove Track A mock scaffold
- [x] Build passes (no Suspense/prerender errors)
- [x] Manual smoke both env states

## Success Criteria
- `/prelaunch` renders background + title + 3 live LED blocks; values tick at minute resolution.
- At zero, client auto-navigates to sanitized `?next=` (or `/`).
- No hydration or `useSearchParams`-Suspense build errors.

## Risk Assessment
| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| Track A prop shape differs from contract | Med | Med | Contract stated up front; adapt import/mapping in client wrapper only |
| `useSearchParams` prerender error | Med | Med | Suspense boundary in page (step 3) |
| Two tracks both authored `page.tsx` | Low | Med | This phase owns final `page.tsx`; Track A version is throwaway |
| Hydration mismatch on initial digits | Low | Low | SSR-safe `00 00 00` fallback in Suspense; client resyncs on mount |

## Security Considerations
- `/prelaunch` is public (no auth) both before and after launch — matches permissions delta.
- Redirect sanitization already enforced by Phase 02 hook.

## Next Steps
- Phase 04: run the full unit + e2e matrix against this merged code.
- Doc sync: reconcile `docs/system/permissions.md` (add `/prelaunch` row + time-gate layer) at promote,
  when the provisional F003 code is finalized.
