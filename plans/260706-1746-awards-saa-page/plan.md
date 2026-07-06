---
title: "F004 — Hệ thống giải thưởng (Awards Information) screen"
description: "Replace the /awards placeholder with full SAA 2025 awards content: hero, scroll-spy nav, 6 detail cards, Sun* Kudos."
status: done
priority: P2
effort: 12h
branch: main
tags: [frontend, nextjs, awards, saa-2025, scroll-spy]
created: 2026-07-06
---

# F004 — Awards Information Screen

Build real content for `/awards` (currently a placeholder), per spec
`spec/awards-page/feature.md` (FR-1..FR-15) and `clarifications.md` (3 locked
decisions: real IntersectionObserver scroll-spy · reuse `public/homepage-saa/`
images · reuse `SunKudosSection` as-is before footer).

## Layout correction (READ FIRST)
`app/layout.tsx` is minimal (html/body only) — it does NOT render header/footer.
The homepage renders `SiteHeader`/`SiteFooter` itself. So the new `page.tsx`
MUST render `SiteHeader` + `SiteFooter` (mirroring `app/page.tsx`). The task's
"footer comes from layout" note is incorrect for this repo.

## Client boundary
Server: `page.tsx` (async, `requireUser()` + metadata + static composition).
Client: `use-scroll-spy` hook, `awards-nav-menu`, `awards-catalog` (owns the
hook, wires nav↔cards). `award-detail-card`, `awards-hero`, title are pure
presentational (render inside the client catalog / server page as needed).

## Phases
| # | Phase | Status | Depends | Owns (files) |
|---|-------|--------|---------|--------------|
| 01 | Scroll-spy hook | done | — | `hooks/use-scroll-spy.ts` + test |
| 02 | Detail card + data | done | — | `app/components/awards/award-detail-card.tsx`, `award-detail-data.ts` + test |
| 03 | Nav menu (client) | done | — | `app/components/awards/awards-nav-menu.tsx` + test |
| 04 | Hero keyvisual | done | — | `app/components/awards/awards-hero.tsx` + test |
| 05 | Composition + page | done | 01,02,03,04 | `app/components/awards/awards-catalog.tsx`, `app/awards/page.tsx`, update `tests/unit/awards-page.test.tsx` |
| 06 | E2E + regression | done | 05 | `e2e/awards-content.spec.ts` |

Phases 01–04 share no files → parallel-runnable. 05 integrates all. 06 last.

## Key dependencies / open items
- ~~FR-12 long descriptions not in spec~~ — **RESOLVED**: verbatim descriptions
  (from MoMorph node tree, `zFYDgyj_pD`) added to `spec/awards-page/feature.md`
  §2.5. Phase 02 unblocked — implementer reads them from the spec, no MoMorph
  round-trip needed.
- New icon assets already downloaded: `public/awards-saa/Icon-Target.svg`,
  `Icon-Diamond.svg`, `Icon-License.svg` (nav leading icon / quantity / prize
  value — not present in `public/homepage-saa/`, which only has award photos
  + keyvisual + kudos assets reused from F002).
- Slugs are frozen (`lib/awards/award-categories.ts`) — do not rename.
- Do not modify `sun-kudos-section.tsx`, `award-card.tsx`, `proxy.ts`.

## Phase files
- [phase-01-scroll-spy-hook.md](./phase-01-scroll-spy-hook.md)
- [phase-02-award-detail-card-and-data.md](./phase-02-award-detail-card-and-data.md)
- [phase-03-awards-nav-menu.md](./phase-03-awards-nav-menu.md)
- [phase-04-awards-hero.md](./phase-04-awards-hero.md)
- [phase-05-page-composition.md](./phase-05-page-composition.md)
- [phase-06-tests-e2e.md](./phase-06-tests-e2e.md)
</content>
</invoke>
