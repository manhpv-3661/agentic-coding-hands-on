# Debug Report: `/kudos` missing-key warning in `KudosBoard`

## Symptom
On initial load of `/kudos` (React 19.2.4 / Next 16.2.10, Turbopack), console/SSR logged:

```
Each child in a list should have a unique "key" prop.%s%s See https://react.dev/link/warning-keys for more information.

Check the render method of `KudosBoard`.  It was passed a child from KudosPage.
```

## Reproduction
- Dev server: `NEXT_DIST_DIR=build-debug-key ... npx next dev -p 3007` (no Supabase env → auth bypassed, `/kudos` renders directly).
- `curl /kudos` alone did not surface the warning in the server terminal (SSR render for this tree doesn't hit the check on this Next/React combo); reproduced instead with a headless Playwright page (`chromium`) hitting `http://localhost:3007/kudos` and capturing `page.on("console")`. Confirmed exact text above fires once on load.
- `msg.args()` returned only the two format-string fragments (no file/line component stack — React 19's owner-stack capture wasn't enabled in this dev run), so isolation was done empirically via binary search rather than a stack trace.

## Isolation (binary search, via HMR edits to `kudos-board.tsx`, reverted after each step)
| Children rendered in `KudosBoard` | Warning? |
|---|---|
| `HighlightKudosCarousel` + `{spotlight}` + `section(AllKudosFeed, {sidebar})` (original) | Yes |
| Same minus `{spotlight}` (sidebar kept) | No |
| Same minus `{sidebar}` (spotlight kept) | Yes |
| `<div>{spotlight}</div>` alone (spotlight as sole child) | No |
| `<div>{spotlight}</div>` (**plain sibling** + `{spotlight}` — 2 children) | Yes |

Conclusion: the warning requires (a) the `spotlight` slot present, AND (b) `spotlight` sitting alongside at least one sibling child. `sidebar` never triggers it, in the same position, with the same "multiple static JSX children" shape.

## Root cause
`spotlight` (`app/kudos/page.tsx`) is `<SpotlightBoard .../>` — `SpotlightBoard` itself is a `"use client"` component (`app/components/kudos/spotlight-board.tsx:1`). `sidebar` is `<KudosSidebar .../>`, a plain Server Component (no `"use client"` at its own top level; its client leaf `OpenGiftButton` is nested deeper).

`KudosPage` (Server Component) creates the `<SpotlightBoard/>` element and passes it as a prop into `KudosPageClient` → `KudosBoard` (both Client Components). When a Server Component hands a *Client Component's own element* across the RSC/Flight boundary to be one of several sibling children inside a Client Component's JSX, that element is reconstructed client-side as a genuine runtime array entry rather than a compiler-known-static child, so React's `validateChildKeys` treats it like any other keyless array item and warns — attributing the "created at" owner to `KudosPage` (where the JSX literal for `<SpotlightBoard/>` was written) while blaming `KudosBoard`'s render for the un-keyed list. A plain Server Component element (`KudosSidebar`) resolves fully during the RSC render and does not hit this path, which is why only `spotlight` warned and `sidebar` never did — ruling out "KudosBoard's JSX shape" and "SpotlightBoard's internal `.map()`" (its `SpotlightNameCloud` list already has a correct `key={`${name}-${index}`}`, confirmed by reading `app/components/kudos/spotlight-name-cloud.tsx:41`) as causes.

## Fix
Minimal, at the true source (`app/kudos/page.tsx`) — added `key="spotlight-board"` to the `<SpotlightBoard/>` element that crosses the Server→Client slot boundary as one of `KudosBoard`'s several children:

```diff
           spotlight={
             <SpotlightBoard
+              key="spotlight-board"
               names={SPOTLIGHT_NAMES}
               total={SPOTLIGHT_TOTAL}
               labels={dictionary.kudos.spotlight}
```

Did not touch `KudosSidebar`/`sidebar` — confirmed via the isolation table it never produced the warning; adding a key there would be speculative, not evidence-driven. Did not touch `kudos-board.tsx` (reverted to byte-identical state after the binary-search edits — `git diff --stat` empty for that file).

## Verification
- Playwright console-capture against the live dev page: 0 warnings/errors after the fix (was reproducing the exact warning before).
- `npx vitest run app/components/kudos tests/unit/kudos-page.test.tsx tests/unit/kudos-compose.test.tsx` → 29 files / 141 tests passed.
- `npx tsc --noEmit` → clean, no output.
- Dev server (port 3007, `build-debug-key` dist dir) stopped; `build-debug-key/` removed; scratch Playwright scripts removed. Only `app/kudos/page.tsx` carries a diff (`git status --short` confirms `kudos-board.tsx` untouched relative to session start).

## Unresolved questions
- Why exactly Flight/Turbopack drops the "static children" annotation specifically for a Client-Component element slotted across an RSC boundary (vs. a Server-Component element in the same position) wasn't traced into React/Next internals (`node_modules` reads/greps are sandboxed off in this environment) — root cause is proven empirically (isolation table) rather than via source-level confirmation. If this recurs elsewhere, the practical rule is: any JSX element created in a Server Component that (a) is itself a Client Component and (b) gets threaded as a ReactNode "slot" prop into another Client Component where it will render alongside sibling children needs an explicit `key`.

**Status:** DONE
**Summary:** Reproduced the warning via a headless-browser console capture (curl/SSR alone didn't surface it); binary-search isolation on `kudos-board.tsx` proved only the `spotlight` slot (not `sidebar`) triggers it, and only when it has sibling children. Root cause: `SpotlightBoard` is a Client Component element created in the Server Component `page.tsx` and threaded as a slot into `KudosBoard`'s multi-child JSX — crossing that RSC boundary loses the "static children" key-exemption, unlike `KudosSidebar` which is a Server Component. Fixed by adding `key="spotlight-board"` to the `<SpotlightBoard/>` element in `app/kudos/page.tsx` — the one line that actually needed it. Verified: warning gone, vitest 141/141 passed, tsc clean.
**Concerns/Blockers:** None blocking. Left as an unresolved question: the precise React/Next internal mechanism (Flight serialization dropping the static-children flag for boundary-crossing Client Component elements) wasn't traced past `node_modules` (sandbox blocks reads there) — conclusion rests on empirical isolation, not source inspection.
