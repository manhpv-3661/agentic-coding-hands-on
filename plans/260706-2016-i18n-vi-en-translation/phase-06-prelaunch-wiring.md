# Phase 06 — Prelaunch wiring (`/prelaunch`)

## Context Links
- Spec: FR-4, FR-10
- Strings: `reports/researcher-260706-catalog-prelaunch.md` (2 keys + 2 bonus)
- Depends on: Phase 01 ONLY (no shared shell on this screen — can start right after the dict lands)

## Overview
- **Priority:** P3 (smallest screen)
- **Status:** done
- **Description:** Wire the bare countdown gate screen. No header/footer/language-selector here, so
  this phase depends only on Phase 01 and runs in parallel with Phase 02.

## Key Insights
- `prelaunch/page.tsx` is a Server Component but currently NOT async → make it `async` to `await
  getLocale()`.
- Threading twist: `PrelaunchContent` (Server, holds heading + labels) is rendered BOTH as the
  `<Suspense fallback>` (directly by page) AND by `PrelaunchCountdownClient` (Client). So the page must
  pass the dict slice to BOTH the fallback element and the client wrapper.
- `PrelaunchCountdownClient` (Client) receives the dict slice as a serializable prop and forwards it
  to `PrelaunchContent`.
- `countdown-led-unit.tsx` needs NO edit — its `label` is already a prop; `prelaunch-content.tsx`
  passes `shared.countdown.days|hours|minutes` instead of the `"DAYS"` literals.
- Heading `Sự kiện sẽ bắt đầu sau` → `prelaunch.countdown.heading`. Countdown labels use the SHARED
  `shared.countdown.*` (same key set as Homepage — see plan decision).
- Prelaunch meta description had no VI before → dict has a newly authored VI value (Phase 01).

## Requirements
- FR-4: page reads locale/dict, threads slices.
- FR-10: heading + meta title/description + shared countdown labels rendered from dict.

## Architecture — prop flow
```
prelaunch/page.tsx (Server, now async):
  const locale = await getLocale(); const d = getDictionary(locale);
  generateMetadata() → d.prelaunch.meta.{title,description}
  const cd = { heading: d.prelaunch.countdown.heading, labels: d.shared.countdown };
  <Suspense fallback={<PrelaunchContent days="00" hours="00" minutes="00" content={cd} />}>
    <PrelaunchCountdownClient content={cd} />
  </Suspense>

PrelaunchCountdownClient (Client): forwards content → <PrelaunchContent ... content={content} />
PrelaunchContent: heading = content.heading; label={content.labels.days|hours|minutes}
```

## Related Code Files
- **Modify (OWNED):** `app/prelaunch/page.tsx`, `app/prelaunch/prelaunch-countdown-client.tsx`,
  `app/prelaunch/components/prelaunch-content.tsx`
- **Read for context:** Phase 01 exports; `countdown-led-unit.tsx` (no edit — label already prop)
- **NOT owned:** nothing shared

## Implementation Steps
1. `page.tsx`: make `export default async function`; add `getLocale`/`getDictionary`; add
   `generateMetadata()`; remove static `metadata`; build `cd`; pass `content={cd}` to both the
   fallback `<PrelaunchContent>` and `<PrelaunchCountdownClient>`.
2. `prelaunch-countdown-client.tsx`: add `content` prop, forward to `<PrelaunchContent>`.
3. `prelaunch-content.tsx`: add `content: { heading; labels }` to props; render `content.heading`;
   pass `label={content.labels.days}` etc into the three `<CountdownLedUnit>`; update the file's
   docstring (currently says "static Vietnamese, not translated" — now IS translated, note supersede).
4. Typecheck. Confirm `<Suspense>` fallback still renders `"00"` digits with the new content prop.

## Todo List
- [x] page.tsx: async + getLocale/getDictionary + generateMetadata + pass content to both branches
- [x] prelaunch-countdown-client: content prop forwarded
- [x] prelaunch-content: heading + shared countdown labels from content prop; fix docstring

## Success Criteria
- `/prelaunch` heading + DAYS/HOURS/MINUTES render VI/EN per cookie on first server paint.
- Suspense fallback (SSR "00 00 00") shows correct-locale labels too (no English flash for VI users).
- `<title>` reflects locale.

## Risk Assessment
- **Server component in Client boundary** (Low/Med): `PrelaunchContent` becomes part of the client
  bundle (already does today). Passing serializable string props is safe. Countermove: no server-only
  imports enter `PrelaunchContent`.
- **Fallback/live divergence** (Low/Low): both branches must get the same `content`. Countermove:
  build `cd` once, pass to both.
- **Making page async breaks the time-gate** (Low/Med): `proxy.ts` handles the redirect gate, not this
  page — constraint says don't touch `proxy.ts`. Making the page async does not affect the gate.

## Security Considerations
- None new. Prelaunch is a pre-auth public gate; content is non-sensitive countdown copy.

## Next Steps
- Can begin immediately after Phase 01. Feeds Phases 07/08.
