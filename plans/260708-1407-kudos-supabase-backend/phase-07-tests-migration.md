# Phase 07 — Tests Migration (unit + e2e)

## Context Links
- Depends on: Phases 04, 05, 06.
- Affected e2e: `e2e/layout-contract.spec.ts` (authless, port 3100 — relies
  on mock rendering without auth), `playwright.config.ts` (3 hermetic builds).
- Affected unit: `app/components/kudos/kudos-page-client.test.tsx`,
  `.../compose/compose-dialog.test.tsx`, `.../kudos-card.test.tsx`,
  `lib/kudos/kudos-selectors.test.ts` (should be unaffected — pure).

## Overview
- **Priority:** P1
- **Status:** pending
- **Description:** Update unit tests for the async action-backed flows, add
  unit tests for the new repository mapper + actions, and confirm the
  authless e2e stays green via the mock-fallback branch (the migration's key
  safety net). NO test cheats — real assertions against final code.

## Key Insights — e2e impact (critical)
- `layout-contract.spec.ts` + spotlight-name-cloud test run on
  **chromium-authless** (port 3100, NO Supabase env). Because the repository
  falls back to `KUDOS_POSTS`/`SPOTLIGHT_*` when `!isSupabaseConfigured()`,
  these specs render mock content exactly as today → **should stay green
  with zero e2e changes**. This must be explicitly verified, not assumed.
- The chromium project (port 3000, fake truthy creds) only tests auth
  redirects (never renders kudos content) — unaffected.
- Do NOT introduce a real-DB e2e build now (needs a seeded live Supabase +
  auth session; heavy). Real-backend behavior is covered by unit/integration
  tests against the actions/repository with a mocked Supabase client.

## Requirements
- New unit tests: `mapRowToKudosPost` (anonymous, self-authored,
  hearts-excludes-own-like); `getKudosPosts`/`getLikedPostIds` mock-vs-configured
  branch (mock the Supabase client + `isSupabaseConfigured`).
- New unit tests: `createKudosAction`/`toggleLikeAction` — auth guard,
  self-like reject, 23505 no-op, mock-mode skip (mock `createClient`).
- Update `kudos-page-client.test.tsx`: submit + like now call injected async
  actions; assert optimistic prepend/flip still happens and rollback on
  error. Keep tests deterministic (inject fake action returning `{ok}` /
  `{ok:false}` / `{skipped}`), no real network.
- Confirm `compose-dialog.test.tsx` still passes (serializable input path).

## Architecture — test strategy
```
Pure mapper .............. vitest, no mocks
Repository branch ........ vitest, mock isSupabaseConfigured + supabase client
Server actions ........... vitest, mock createClient (auth + from().insert/delete)
Client components ........ RTL, inject fake async action props (deterministic)
Authless layout e2e ...... unchanged; VERIFY mock fallback keeps it green
```

## Related Code Files
- **Create:** `lib/kudos/kudos-repository.test.ts`,
  `lib/kudos/kudos-row-mapper.test.ts`, `app/kudos/actions.test.ts`.
- **Modify:** `app/components/kudos/kudos-page-client.test.tsx`,
  `app/components/kudos/compose/compose-dialog.test.tsx`,
  `app/components/kudos/kudos-card.test.tsx` (only if like-prop shape shifts).
- **Verify unchanged:** `e2e/layout-contract.spec.ts`, `playwright.config.ts`,
  `lib/kudos/kudos-selectors.test.ts`.

## Implementation Steps
1. Write repository/mapper/action unit tests (mock Supabase client).
2. Update client-component tests to inject fake async actions + assert
   optimistic + rollback.
3. Run `npm run test` (vitest) → all green.
4. Run `npm run e2e` (or at least the authless project) → layout-contract +
   spotlight-name-cloud green with mock fallback. Capture as proof.
5. `npm run lint` clean.

## Todo List
- [ ] mapper unit tests
- [ ] repository branch unit tests
- [ ] actions unit tests (auth/self-like/23505/skip)
- [ ] update page-client tests (async + rollback)
- [ ] verify compose-dialog + selectors tests pass
- [ ] verify authless e2e green (mock fallback)
- [ ] lint clean

## Success Criteria
- `npm run test` + `npm run e2e` + `npm run lint` all green on final code.
- Authless layout-contract + spotlight tests unchanged AND passing.
- No mocked-away assertions that hide real behavior (per project rules).

## Risk Assessment
- **[High] Authless e2e breaks** if repository doesn't fall back to mock →
  the whole migration-safety premise fails. This phase's #1 gate.
- **[Med] Flaky async tests** — inject deterministic fake actions, no real
  timers/network; reuse the existing toast `setTimeout` test pattern.
- **[Med] Supabase client mocking surface** — capture one real row shape in
  Phase 02 to keep mocks faithful.

## Rollback
Tests are additive/updates; if a client-flow test can't be stabilized,
revert that component to mock-only (Phase 04/05 rollback) rather than
weakening the assertion.

## Next Steps
Green suite unblocks Phase 08 (docs) and merge.
