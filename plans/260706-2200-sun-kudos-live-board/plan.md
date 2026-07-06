---
title: "F006 — Sun* Kudos Live Board screen"
description: "Replace the /kudos placeholder with the full Kudos live board: banner, highlight carousel, spotlight board, all-kudos feed + stats sidebar + top-10 gifts, hashtag/department filters."
status: done
priority: P2
effort: 18h
branch: main
tags: [frontend, nextjs, kudos, saa-2025, carousel]
created: 2026-07-06
work_type: feature
spec: docs/features/f006-sun-kudos-live-board/
---

# F006 — Sun* Kudos Live Board

Build real content for `/kudos` (currently a F002 placeholder), per spec
`spec/sun-kudos-live-board/feature.md` (FR-1..FR-21, NFR-1..NFR-4) and
`clarifications.md` (20+ locked scope decisions). MoMorph screen `MaZUn5xHXZ`
(fileKey `9ypp4enmFmdK3YAFJLIu6C`).

## Read first (locked constraints)
- `app/layout.tsx` renders only html/body — header/footer are NOT global.
  `page.tsx` MUST render `SiteHeader` + `SiteFooter` itself (mirror `app/page.tsx`).
- `proxy.ts` already gates `/kudos` (P01) → **no proxy change**. Keep `requireUser()`.
- Out of scope (render-only, no logic): like/heart toggle (static `<span>`, NOT a
  `<button>`), compose dialog, full reward mechanic, `/kudos/[id]` detail route,
  profile routing (avatars/names are static, no `<Link>`). See `clarifications.md`.
- In scope for real: Copy Link (clipboard + toast), Spotlight substring search,
  carousel navigation, hashtag/department filter, minimal static "Mở quà" dialog.
- No new deps (no carousel/word-cloud lib — custom hook like `use-scroll-spy.ts`).
- Data: one static mock module `lib/kudos/*` is the single source of truth.

## Client / server boundary (authoritative)
- **Server:** `page.tsx` (requireUser + locale/dict + static data wiring), `avatar`,
  `kudos-image-gallery`, `kudos-section-heading`, `kudos-card`, `kudos-sidebar`,
  `kudos-stats-box`, `recent-gift-recipients` (all pure presentational — no hooks).
- **Client (`"use client"`):** `kudos-board` (filter state), `highlight-kudos-carousel`,
  `spotlight-board`, `all-kudos-feed`, `copy-link-button`, `open-gift-button`,
  `hooks/use-carousel.ts`. `kudos-filters` is presentational (value+onChange), rendered
  inside the client board.
- **Filter state lives in ONE place:** `kudos-board.tsx` `useState` (no context —
  repo has zero context precedent; prop-drilling to 2 consumers is KISS/YAGNI).
  Spotlight + sidebar are passed to the board as server-rendered **slot props**
  (`ReactNode`) so they stay out of the filter logic and the client bundle.

## Phases
| # | Phase | Status | Depends | Owns (files) |
|---|-------|--------|---------|--------------|
| 01 | Mock data module | done | — | `lib/kudos/*` + selector test |
| 02 | i18n `kudos` namespace | done | — | `lib/i18n/dictionaries/vi.ts`, `en.ts` |
| 03 | Shared primitives + hook | done | — | `app/components/kudos/{avatar,copy-link-button,kudos-image-gallery,kudos-section-heading}.tsx`, `hooks/use-carousel.ts` + tests |
| 04 | Shared Kudos card | done | 01,03 | `app/components/kudos/kudos-card.tsx` + test |
| 05 | Highlight carousel | done | 01,03,04 | `app/components/kudos/highlight-kudos-carousel.tsx` + test |
| 06 | Spotlight board | done | 01,03 | `app/components/kudos/{spotlight-board,spotlight-name-cloud}.tsx` + tests |
| 07 | All-Kudos feed + sidebar | done | 01,03,04 | `app/components/kudos/{all-kudos-feed,kudos-sidebar,kudos-stats-box,open-gift-button,recent-gift-recipients}.tsx` + tests |
| 08 | Board + page composition | done | 02,05,06,07 | `app/components/kudos/{kudos-board,kudos-filters}.tsx`, `app/kudos/page.tsx` |
| 09 | Page test + green gate | done | 08 | `tests/unit/kudos-page.test.tsx` |

01·02·03 share no files → parallel. 04 needs 01+03. 05/06/07 parallel after their
deps. 08 integrates all. 09 last. No two parallel phases touch the same file.

## Key dependencies / open items
- Stats sidebar row count: FR-18 says 4 rows; the reviewed screenshot shows 5
  (adds a "hearts" row). Data models stats as a label/value list → both work;
  Phase 07 follows the screenshot (5) as label ground-truth, cites FR-18.
  **Resolved:** `KudosStats` carries all 5 fields (received/sent/hearts/
  secretBoxOpened/secretBoxUnopened); `kudos-stats-box.tsx` renders all 5.
- "Mở quà" label: FR-19 = "Mở quà"; screenshot = "Mở Secret Box". Phase 02 keys it
  once; implementer confirms verbatim against design. **Resolved:** used the
  design-verbatim "Mở Secret Box" (`dictionary.kudos.gift.openButton`), noted
  in a code comment in `vi.ts`.
- English design labels ("HIGHLIGHT KUDOS", "SPOTLIGHT BOARD", "ALL KUDOS", "KUDOS"
  wordmark, section subtitle "Sun* Annual Awards 2025") stay hardcoded literals,
  untranslated — same precedent as awards page keeping "Sun* annual awards 2025".

## Phase files
- [phase-01-kudos-mock-data.md](./phase-01-kudos-mock-data.md)
- [phase-02-i18n-kudos-namespace.md](./phase-02-i18n-kudos-namespace.md)
- [phase-03-shared-primitives-and-hook.md](./phase-03-shared-primitives-and-hook.md)
- [phase-04-shared-kudos-card.md](./phase-04-shared-kudos-card.md)
- [phase-05-highlight-kudos-carousel.md](./phase-05-highlight-kudos-carousel.md)
- [phase-06-spotlight-board.md](./phase-06-spotlight-board.md)
- [phase-07-all-kudos-feed-and-sidebar.md](./phase-07-all-kudos-feed-and-sidebar.md)
- [phase-08-board-and-page-composition.md](./phase-08-board-and-page-composition.md)
- [phase-09-page-test-and-green-gate.md](./phase-09-page-test-and-green-gate.md)
