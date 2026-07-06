# Phase 01 — Foundation: selector + i18n + card-labels type

## Context Links
- Plan: [plan.md](plan.md)
- Selector module: `lib/kudos/kudos-selectors.ts` (pattern: `getDistinctRecipients`)
- Dictionary: `lib/i18n/dictionaries/vi.ts` (card at ~209), `en.ts` (card at ~181)
- Parity enforced by `lib/i18n/dictionaries/parity.test.ts` + `Dictionary = typeof vi`

## Overview
- **Priority:** P2 (must land first — Phase 02/03 depend on these types/labels)
- **Status:** pending
- **Description:** Add the pure own-post selector and the two new i18n aria-labels
  (`like`/`unlike`) plus their `KudosCardLabels` type slot. No UI change yet.

## Key Insights
- `getDistinctRecipients` already excludes `currentUser` by `name` — reuse that idiom.
- Dictionary parity is compile-enforced (`Dictionary = typeof vi`); adding a key to `vi`
  without `en` fails `tsc`. Add to BOTH, same shape.
- The `card` slice already pairs a dual label idiom (`copyLink`/`copied`) — `like`/`unlike`
  follows the same DRY pattern for a toggled aria-label.

## Requirements
- **FR-1:** `canLikeKudos(post, currentUser)` returns `post.sender.name !== currentUser.name`.
- **FR-2:** `kudos.card.like` + `kudos.card.unlike` exist in vi + en (aria-labels).
- **NFR-1:** No mutation, no new deps, files stay <200 lines.

## Architecture
- `canLikeKudos` is a pure boolean fn in `kudos-selectors.ts` (no React, server-safe).
- Labels thread through the existing `Dictionary["kudos"]["card"]` → `KudosCardLabels`
  (extended in Phase 02; the raw dictionary keys are added here so Phase 02 can consume).

## Related Code Files
- **Modify:** `lib/kudos/kudos-selectors.ts` (add `canLikeKudos`)
- **Modify:** `lib/kudos/kudos-selectors.test.ts` (add tests)
- **Modify:** `lib/i18n/dictionaries/vi.ts` (add `like`/`unlike` to `card`)
- **Modify:** `lib/i18n/dictionaries/en.ts` (add `like`/`unlike` to `card`)
- **Create:** none · **Delete:** none

## Implementation Steps
1. In `kudos-selectors.ts` add, mirroring `getDistinctRecipients` doc style:
   ```ts
   /** True when `currentUser` may like `post` — i.e. it is not their own
    * post (sender name differs). Mirrors `getDistinctRecipients`'s
    * currentUser-exclusion; a user cannot like their own Kudos. */
   export function canLikeKudos(post: KudosPost, currentUser: KudosPerson): boolean {
     return post.sender.name !== currentUser.name;
   }
   ```
2. In `vi.ts` `card` slice add: `like: "Thả tim",` and `unlike: "Bỏ thả tim",`.
3. In `en.ts` `card` slice add: `like: "Like",` and `unlike: "Unlike",` (same keys).
4. Add unit tests (see below) to `kudos-selectors.test.ts`.
5. Run `npx tsc --noEmit` (via build) — parity + type must be clean.

## Todo List
- [ ] Add `canLikeKudos` to `kudos-selectors.ts`
- [ ] Add `like`/`unlike` to vi.ts `card`
- [ ] Add `like`/`unlike` to en.ts `card`
- [ ] Add `canLikeKudos` unit tests
- [ ] `npx vitest run lib/kudos lib/i18n` green; `tsc --noEmit` clean

## Success Criteria
- `canLikeKudos(ownPost, user) === false`, `canLikeKudos(otherPost, user) === true`.
- `parity.test.ts` stays green (vi/en keys match).
- No existing test regresses.

## Risk Assessment
- **Low.** Additive only. Risk: forgetting `en` key → tsc fail. Mitigation: add both in
  same edit, run build.

## Security Considerations
- None (pure client mock data, no auth/PII).

## Next Steps
- Phase 02 consumes `KudosCardLabels.like/unlike` and renders the interactive heart.
