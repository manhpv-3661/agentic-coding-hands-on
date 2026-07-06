# Phase 03 — Placeholder Routes (`/awards`, `/kudos`)

## Context Links
- Spec: `spec/f002-homepage/feature.md` FR-5, FR-20, FR-21, FR-24.
- Clarification: create minimal PROTECTED placeholders so links/CTA/hash-anchors work & E2E pass; real screens later.
- Depends on **P01** `lib/auth/require-user.ts` (server guard helper).
- Pattern reference: `app/todo/page.tsx` (server component + guard).

## Overview
- Priority: P2. Status: ✅ **COMPLETE**. Depends on: P01.
- Two minimal protected pages. `/awards` renders 6 section anchors (one per award slug) so
  homepage hash links (`/awards#<slug>`) scroll to a real target. `/kudos` a single stub section.

## Key Insights
- Single source of truth for the 6 award categories (slug + title) lives here and is imported by
  Track A award cards at integration (DRY — cards & anchors share the same slugs).
- Anchor scroll only needs elements with matching `id`; no real content required.

## Requirements
- FR-5: both routes protected (proxy matcher in P01 + server guard here).
- FR-20/21: 6 slugs = Top Talent, Top Project, Top Project Leader, Best Manager,
  Signature 2025 - Creator, MVP → each an anchor `id` on `/awards`.
- FR-24: `/kudos` stub section.

## Architecture / Data Flow
```
lib/awards/award-categories.ts:
  export const AWARD_CATEGORIES = [{ slug, title }, …6]  // single source of truth
app/awards/page.tsx (server): await requireUser(); map AWARD_CATEGORIES → <section id={slug}>
app/kudos/page.tsx  (server): await requireUser(); single stub section
Homepage cards (Track A, wired P06) → href `/awards#${slug}` → browser hash-scroll
```

## Related Code Files
- **Create:** `lib/awards/award-categories.ts`, `app/awards/page.tsx`, `app/kudos/page.tsx`.
- File ownership: OWNS these 3. `award-categories.ts` is read (not edited) by P06/Track A cards.

## Implementation Steps
1. `lib/awards/award-categories.ts`: export `AwardCategory` type + `AWARD_CATEGORIES` array (6 entries). Slugs kebab-case, stable (e.g. `top-talent`, `top-project`, `top-project-leader`, `best-manager`, `signature-2025-creator`, `mvp`).
2. `app/awards/page.tsx`: `export default async function` → `await requireUser()`; render heading + `AWARD_CATEGORIES.map(c => <section id={c.slug} className="scroll-mt-24">…title…</section>)`. Add `export const metadata` title.
3. `app/kudos/page.tsx`: same guard + single stub section + metadata.
4. Keep each file < 200 lines, minimal styling (Track A restyles later; placeholders just need structure + anchors).
5. Compile / build; manually confirm `/awards#mvp` scrolls (dev server) or defer to P07 E2E.

## Todo List
- [x] `award-categories.ts` with 6 stable slugs
- [x] `app/awards/page.tsx` guarded + 6 anchors (`scroll-mt` offset)
- [x] `app/kudos/page.tsx` guarded stub
- [x] metadata on both; type-check clean

## Success Criteria
- Both routes require auth (guard) and render; each award slug has a matching anchor element.
- `AWARD_CATEGORIES` is the only place the 6 slugs are defined.

## Risk Assessment
- **Slug drift (Med/Med):** cards vs anchors disagree → dead hash. Mitigate: shared `AWARD_CATEGORIES`; P07 E2E asserts each `#slug` target exists.
- **P01 not merged (Low/Low):** helper missing → import error. Mitigate: dependency ordering (P03 after P01).
- Rollback: delete `app/awards`, `app/kudos`, `lib/awards` (additive).

## Security
- Both routes gated by `requireUser()` (defense-in-depth) + proxy matcher (P01).

## Next Steps
- Slugs + routes consumed by P06 (wire homepage card hrefs) and P07 (anchor E2E).

## Actual Outcome
✅ All completed as planned.
- `lib/awards/award-categories.ts`: `AwardCategory` type and `AWARD_CATEGORIES` array with 6 entries created. Slugs: `top-talent`, `top-project`, `top-project-leader`, `best-manager`, `signature-2025-creator`, `mvp`.
- `app/awards/page.tsx`: server component with `requireUser()` guard. Renders heading and 6 section anchors mapped from `AWARD_CATEGORIES`, each with `id={slug}` and `scroll-mt-24` class for offset scrolling.
- `app/kudos/page.tsx`: server component with `requireUser()` guard. Renders single stub section with metadata.
- Both routes protected by proxy (P01) and server guard (defense-in-depth). Hash-scroll target validation confirmed in E2E tests.
- Type-check: `tsc --noEmit` clean.
