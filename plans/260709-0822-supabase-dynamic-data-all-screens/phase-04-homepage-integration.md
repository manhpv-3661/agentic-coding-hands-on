# Phase 04 — Homepage Integration (Event Settings + Award Grid)

## Context Links
- Research: R2 (award grid triplication `awards-section.tsx:33-76`; event venue `event-info.tsx:48`; date drift; hero copy stays dict), R4 (env-var gating stays)
- Reuses: `getAwardCategories()` + `formatVnd()` (phase-02), `event_settings` (phase-01)
- Depends on: phase-01, phase-02

## Overview
- **Priority:** P1 · **Status:** pending
- **Description:** Create the event-settings repository; rewire the homepage server component to (a) feed the award grid from `getAwardCategories()` (deleting the duplicated `AWARDS` array), (b) read venue/name from `event_settings`, and (c) derive the displayed event date from the single env-var timestamp via Intl. Hero/narrative copy stays in the dict (out of scope).

## Key Insights
- `awards-section.tsx` is a SERVER component (imports `AWARD_CATEGORIES`, takes `Dictionary` prop) → can consume the repo via props from `app/page.tsx`.
- The homepage award grid re-lists the same 6 titles/thumbnails as `/awards` (R2 confirmed drift) → replace with the phase-02 repo; single source now.
- **Date drift fix (R2 item 4):** three disagreeing dates today (env var, `en.ts:67` "December 26, 2025", `vi.ts:81` "26/12/2025"). Resolution: ONE timestamp = `NEXT_PUBLIC_EVENT_START_AT`; derive the displayed date string via `Intl.DateTimeFormat(locale)` at render; remove the hand-typed dict date literals' role as source. Gating in `proxy.ts` unchanged (R4).
- Venue "Âu Cơ Art Center" + event name → from `event_settings`. These are proper-noun content, currently bypassing i18n anyway (R2).
- Hero story / Kudos promo / nav / footer / CTA labels → STAY in dict (localized prose, YAGNI). Do NOT migrate.

## Requirements
Functional:
- `getEventSettings()` → `{ eventName, venueName }`. Postgres when configured; static fallback (current values) otherwise.
- Homepage award grid renders from `getAwardCategories()` (numbers via `formatVnd`, labels from dict by slug) — visually identical.
- Event-info section shows venue/name from `getEventSettings()`; displayed date derived from the env-var timestamp via Intl.
- Countdown target unchanged (still env var, client-inlined) — do not reroute the countdown to DB (R4).

Non-functional: repos never throw; fallback on error; server-only guard.

## Architecture
```
app/page.tsx (server)
  ├─ getAwardCategories()   (phase-02 repo)  → awards-section grid props
  ├─ getEventSettings()     (this phase)     → event-info props (venue, name)
  ├─ dict + Intl(env-start) → displayed date string → event-info
  └─ dict                                    → hero / narrative (unchanged)
```
- Displayed date: `Intl.DateTimeFormat(locale, {...}).format(parseEventStart(env))` — reuse `parseEventStart` from `lib/event-countdown.ts` (single timestamp source, no new drift).

## Related Code Files (OWNERSHIP: phase-04 only)
- Create: `lib/event/event-settings-repository.ts` (`getEventSettings()`, fallback)
- Create: `lib/event/format-event-date.ts` (Intl date from the env timestamp, locale-aware) — or co-locate in the repo
- Modify: `app/page.tsx` (fetch award + event data; pass props; derive date)
- Modify: `app/components/home/awards-section.tsx` (remove `AWARDS` array `:33-76`; take grid data as props)
- Modify: `app/components/home/award-card.tsx` (only if the prop shape for numbers changes)
- Modify: `app/components/home/event-info.tsx` (venue/name/date from props instead of literal `:48` + dict date)
- **NOT** touched: `proxy.ts` (gating stays), `hooks/use-event-countdown.ts`, `lib/event-countdown.ts` (countdown unchanged), `app/components/home/{hero-section,root-further-content,sun-kudos-section,site-header,site-footer,nav-link}.tsx` (dict copy stays), `lib/awards/*` (phase-02), `app/components/awards/*` (phase-02)

## Implementation Steps
1. Create `event-settings-repository.ts`: guard → fallback `{ eventName:"Sun* Annual Awards 2025", venueName:"Âu Cơ Art Center" }`; else select the singleton row; error → fallback.
2. Create `format-event-date.ts`: parse env timestamp via `parseEventStart`, format with `Intl.DateTimeFormat(locale)` to match the intended display; verify both locales.
3. `app/page.tsx`: call `getAwardCategories()` + `getEventSettings()`; compute displayed date; pass props down.
4. `awards-section.tsx`: delete inline `AWARDS`; accept grid entries as props (slug + thumbnail + number + dict label merge, same helper as phase-02).
5. `event-info.tsx`: replace literal venue + dict date with props.
6. Compile; verify homepage parity in unconfigured mode.

## Todo List
- [ ] event-settings-repository.ts (fallback branch)
- [ ] format-event-date.ts (Intl, both locales, from env timestamp)
- [ ] app/page.tsx fetch + derive date + props
- [ ] awards-section.tsx: delete AWARDS array, consume repo via props
- [ ] event-info.tsx: venue/name/date from props
- [ ] Compile + homepage visual parity (unconfigured mode)

## Success Criteria
- Homepage visually identical at 1440/1280/768/375 in unconfigured mode — layout-contract e2e green, no e2e edits.
- Only ONE definition of award categories remains (phase-02 repo); `AWARDS` array deleted; no title/thumbnail drift possible.
- Displayed event date derives from the same timestamp that gates routing (no third date).
- Editing seeded `event_settings.venue_name` changes the homepage after revalidate; hero copy still from dict.
- `tsc` clean.

## Risk Assessment
- **Shared file `app/page.tsx` (High/Med if parallelized):** P4 owns it exclusively; P4 runs AFTER P2 (dependency), never concurrently with an award-file phase → no write conflict. Enforced by the dependency edge.
- **Date format mismatch (Med/Med):** Intl output vs prior "December 26, 2025". Mitigation: pick `Intl` options to match; the prior literal was drifted/wrong anyway (R2) — align to the real timestamp, note the intentional change in P5 changelog.
- **Countdown vs displayed-date divergence (Med/Low):** both now derive from the env timestamp → cannot diverge. Verified.
- **Grid label/number merge regression (Med/Med):** reuse phase-02's merge helper (DRY) rather than a second implementation.

## Security Considerations
- `event_settings` anon-readable (homepage pre-login). No auth changes. `proxy.ts` untouched → gating security unchanged.

## Next Steps
- Completes the read paths → P5 docs sync (architecture + feature docs + changelog).
