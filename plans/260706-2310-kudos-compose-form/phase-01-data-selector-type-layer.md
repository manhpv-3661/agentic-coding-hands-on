---
feature: F007
phase: 01
title: Data / selector / type layer
status: done
---

# Phase 01 — Data / selector / type layer

## Context Links
- Spec: FR-3 (distinct recipients), FR-5 (title), FR-18 (anonymous sender), FR-21 (timestamp).
- Clarifications: `CURRENT_USER` mock, `getDistinctRecipients` selector, session-scoped state.
- Research: `researcher-01-*.md` §1-3 (types, mock DB, selectors), §7 (timestamp literal).
- Existing: `lib/kudos/{kudos-types,kudos-data,kudos-selectors}.ts`, `kudos-selectors.test.ts`.

## Overview
- **Priority:** P1 (everything consumes it) · **Status:** pending
- Pure, no React. Additive changes only — do NOT alter existing `KudosPost`/`KudosPerson`
  fields, existing selectors, or existing tests.

## Key Insights
- `KUDOS_POSTS` is a frozen module const (no mutation helper) — keep it that way. Mutation
  lives in the Phase 10 client wrapper, not here.
- `KudosPost.content` stays a plain `string`; the new `title` is a separate optional field.
- Timestamp is a pre-formatted display string (`HH:mm - MM/DD/YYYY`) — no date lib.

## Requirements
- **FR-5:** `KudosPost.title?: string` (optional, additive).
- **FR-3:** `getDistinctRecipients(posts, currentUser)` → distinct people (sender+recipient
  sides), deduped by `name`, excluding `currentUser` by name, first-seen order, no mutation.
- **FR-18:** `CURRENT_USER: KudosPerson` mock (the logged-in Sunner).
- **FR-21:** `formatKudosTimestamp(date: Date): string` → `"HH:mm - MM/DD/YYYY"` (zero-padded).
- **NFR-4:** existing contract untouched; **NFR-2:** files <200 lines.

## Architecture
- `kudos-types.ts`: add `title?: string;` to `KudosPost` (documented as F007-optional).
- `kudos-data.ts`: add
  `export const CURRENT_USER: KudosPerson = { name: "<fresh name>", department: "Phòng Sản phẩm", stars: 8 };`
  — name must NOT match any existing sender/recipient (so recipient list stays full).
- `kudos-selectors.ts`: add
  ```ts
  export function getDistinctRecipients(posts: KudosPost[], currentUser: KudosPerson): KudosPerson[] {
    const seen = new Set<string>([currentUser.name]);
    const out: KudosPerson[] = [];
    for (const post of posts) {
      for (const person of [post.sender, post.recipient]) {
        if (!seen.has(person.name)) { seen.add(person.name); out.push(person); }
      }
    }
    return out;
  }
  ```
- `format-kudos-timestamp.ts` (new): pure `formatKudosTimestamp(date)`; pad2 helper; month is
  `date.getMonth()+1`. Return `` `${hh}:${mm} - ${MM}/${DD}/${yyyy}` ``.

## Related Code Files
- **Modify:** `lib/kudos/kudos-types.ts`, `lib/kudos/kudos-data.ts`, `lib/kudos/kudos-selectors.ts`, `lib/kudos/kudos-selectors.test.ts`
- **Create:** `lib/kudos/format-kudos-timestamp.ts`, `lib/kudos/format-kudos-timestamp.test.ts`

## Implementation Steps
1. Add optional `title?: string` to `KudosPost` with a doc comment (F007, renders as a card heading when present).
2. Add `CURRENT_USER` const to `kudos-data.ts` (import `KudosPerson` type already present).
3. Add `getDistinctRecipients` to `kudos-selectors.ts` (pattern mirrors `getDistinctDepartments`).
4. Extend `kudos-selectors.test.ts` (append a `describe("getDistinctRecipients")`): dedupes by
   name across both sides; excludes `currentUser` (crafted input where currentUser matches a
   post name); safe on empty input; does not mutate input.
5. Create `format-kudos-timestamp.ts` + test: pad-2 on hours/minutes/day/month; e.g.
   `new Date(2026,0,5,9,3)` → `"09:03 - 01/05/2026"`.

## Todo List
- [x] `KudosPost.title?: string`
- [x] `CURRENT_USER` mock (non-colliding name)
- [x] `getDistinctRecipients` selector
- [x] selector tests (dedupe / exclude self / empty / no-mutate)
- [x] `formatKudosTimestamp` + test
- [x] `npx vitest run lib/kudos` green, `npx tsc --noEmit` clean

## Success Criteria
- New selector proven pure + correct; timestamp format matches `HH:mm - MM/DD/YYYY`.
- All existing F006 kudos tests still pass unchanged.

## Risk Assessment
- **`title` change breaks a test (Low/Med):** it is optional → existing title-less posts
  compile and render unchanged. Countermove: verify `kudos-selectors.test.ts` `makePost` needs no edit.
- **`CURRENT_USER` collides with a real name (Low):** pick a name absent from `KUDOS_POSTS`.

## Security Considerations
- Static mock data, no user input at this layer. None beyond existing route gate.

## Next Steps
- Consumed by Phase 03 (recipient options), 04 (mention names), 08 (post build + timestamp),
  09 (title rendering), 10 (wrapper seed + CURRENT_USER).
</content>
