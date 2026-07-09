# Phase 06 — Profiles Identity + Decorative Data Decision

## Context Links
- Depends on: Phase 02 (repository). Parallelizable with 03/04/05 (different
  files — this phase owns identity mapping + decorative-data decisions).
- Current mock identity: `CURRENT_USER` in `lib/kudos/kudos-data.ts`.
- Decorative mocks: `KUDOS_STATS`, `RECENT_GIFT_RECIPIENTS`,
  `SPOTLIGHT_NAMES`/`SPOTLIGHT_TOTAL` (+ name-cloud slots).

## Overview
- **Priority:** P2
- **Status:** pending
- **Description:** Make sender identity real (auth user + profile → the
  `KudosPerson` used as compose `sender`), and DECIDE the fate of the
  decorative aggregate data (recommended: stays mock; confirm via open-Q).

## Key Insights
- OAuth provides `display_name`/`avatar_url` only; `department`/`stars` are
  admin-seeded on `profiles` (Phase 01 trigger leaves them NULL/0).
- Stats sidebar `secretBox*` has no backend meaning (no reward system) →
  keeping it mock is the honest, YAGNI choice.
- Spotlight name-cloud + "388 KUDOS" + gift list are purely visual, not
  per-user, not persisted. The authless e2e's spotlight-name-cloud test
  depends on these rendering → keeping them mock keeps that test green.

## Requirements
- `getCurrentKudosPerson(user)` (Phase 02) maps auth user + profile row →
  `{ name: display_name, department: department ?? '', stars: stars ?? 0 }`;
  mock mode returns `CURRENT_USER`.
- Decorative data: **recommended** keep sourcing `KUDOS_STATS`,
  `RECENT_GIFT_RECIPIENTS`, `SPOTLIGHT_*` from `kudos-data.ts` unchanged.
  (Alternative, if user wants real: compute received/sent/hearts for the
  current user from `kudos_posts`/`kudos_likes`; spotlight = distinct
  recipients; gift list = latest recipients. Deferred pending open-Q — do
  NOT build speculatively.)

## Architecture — data flow
```
page.tsx (server): requireUser() → getCurrentKudosPerson(user)
  → props.currentUser (compose sender + self-like identity)
Decorative slots (sidebar/spotlight): from kudos-data.ts (unchanged) unless
  open-Q flips them to computed aggregates.
```

## Related Code Files
- **Modify:** `lib/kudos/kudos-repository.ts` (`getCurrentKudosPerson`; already
  scaffolded in Phase 02).
- **Modify (only if open-Q flips decorative→real):** `app/kudos/page.tsx`,
  `app/components/kudos/kudos-sidebar.tsx`, `spotlight-board.tsx`.
- **Read:** `lib/kudos/kudos-data.ts`, `lib/auth/require-user.ts`.
- **Keep:** `CURRENT_USER` const (mock-mode fallback) — do not delete.

## Implementation Steps
1. Implement `getCurrentKudosPerson` mapping + mock fallback.
2. Confirm decorative-data open-Q. If "stays mock" (recommended): no further
   change. If "go real": add computed selectors (separate follow-up sizing).

## Todo List
- [ ] `getCurrentKudosPerson` mapping + fallback
- [ ] Confirm decorative-data decision (open-Q)
- [ ] (conditional) computed stats/spotlight selectors

## Success Criteria
- Configured: compose sender shows the real logged-in user's
  name/avatar/department (department blank if unseeded — acceptable).
- Mock mode: `CURRENT_USER` identity, decorative mocks render (e2e green).

## Risk Assessment
- **[Med] Empty department/stars for real users** (unseeded profiles) → card
  shows blank dept / 0 stars. Mitigation: admin-seed, or accept for training.
  Blocking open-Q (who seeds profiles).
- **[Low] Scope creep** if decorative data is forced real — explicitly
  deferred to avoid it.

## Security Considerations
- `getCurrentKudosPerson` reads the caller's own profile via RLS; never
  exposes other users' unshared fields.

## Next Steps
Feeds Phase 04 (compose sender) and Phase 07 (identity-dependent tests).
