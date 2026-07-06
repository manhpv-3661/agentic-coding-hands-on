---
title: "F007 — Kudos Compose Form (Viết Kudos)"
description: "Wire the /kudos composer pill to a client compose dialog: recipient picker, title, minimal rich-text, hashtags, image preview, anonymous toggle — submit prepends a session-scoped KudosPost."
status: done
priority: P2
effort: 16h
branch: main
tags: [frontend, nextjs, kudos, saa-2025, form, dialog]
created: 2026-07-06
work_type: feature
spec: docs/features/f007-kudos-compose-form/
---

# F007 — Kudos Compose Form

Give the F006 "Ghi nhận" composer pill (a confirmed no-op) real behavior: click →
open a client-mounted "Viết Kudos" dialog (FR-1/2). Submit builds a new `KudosPost`
and prepends it to a **session-scoped** posts list surfaced in the All Kudos feed
(FR-21). Spec `docs/features/f007-kudos-compose-form/feature.md` (FR-1..21, NFR-1..5)
+ `clarifications.md` (all scope decisions locked). MoMorph screen `JsTvi8KVQA`.

## Read first (locked constraints)
- **No backend, no persistence.** State lifted into a NEW client wrapper
  `kudos-page-client.tsx` (owns `posts` useState seeded from `KUDOS_POSTS` prop +
  compose open/close + `addPost` prepend). Lost on refresh — accepted (clarifications.md).
- **No new npm deps.** Rich-text = `contentEditable` + `document.execCommand`; dropdown/
  chip/upload all hand-built. Reuse `hooks/use-dismissable-menu.ts` for the recipient
  listbox AND the dialog's Escape/outside-click close.
- **Do not touch the F006 contract's existing fields.** Only additive changes:
  `KudosPost.title?: string` (optional), new `getDistinctRecipients` selector, new
  `CURRENT_USER` mock, one optional title line in `KudosCard`. Heart toggle stays a
  static `<span>` (NFR-5, out of scope).
- Image upload persists **`imageCount` only** (0–5) — no file/URL stored (matches
  `KudosImageGallery` which only ever renders a count).
- Anonymous submit sets `sender = { name: nickname, department: "", stars: 0 }` — no
  new `KudosPost`/`KudosPerson` fields.
- Files <200 lines, kebab-case, one `*.test.tsx` per component (labels as literal
  props, `getByRole` assertions, `vi.fn()` callbacks — F006 style). i18n parity kept.

## Data flow (authoritative)
```
page.tsx (server): requireUser + locale/dict + KUDOS_POSTS + CURRENT_USER
  → getDistinctRecipients(KUDOS_POSTS, CURRENT_USER)  → recipientOptions
  → <KudosPageClient> (NEW client wrapper)
        state: posts (seed KUDOS_POSTS), useDismissableMenu({haspopup:"dialog"})
        addPost(p) = setPosts(prev => [p, ...prev])
        renders: KudosBanner(composerTriggerProps) · KudosBoard(posts) · ComposeDialog
  ComposeDialog: owns all field state + error map → on valid submit builds KudosPost
     (id, formatKudosTimestamp(now), hearts:0, imageCount) → addPost → close → toast
```

## Phases
| # | Phase | Status | Depends | Owns (files) |
|---|-------|--------|---------|--------------|
| 01 | Data / selector / type layer | done | — | `lib/kudos/{kudos-types,kudos-data,kudos-selectors}.ts` + `kudos-selectors.test.ts`, `lib/kudos/format-kudos-timestamp.ts` + test |
| 02 | i18n `kudos.compose.*` namespace | done | — | `lib/i18n/dictionaries/{vi,en}.ts` |
| 03 | Recipient searchable dropdown | done | 01 | `app/components/kudos/compose/recipient-select.tsx` + test |
| 04 | Rich-text editor + toolbar + mentions | done | 01 | `app/components/kudos/compose/{rich-text-editor,rich-text-toolbar,mention-suggestions,community-standards-link}.tsx` + tests |
| 05 | Hashtag chip input | done | — | `app/components/kudos/compose/hashtag-input.tsx` + test |
| 06 | Image upload / preview | done | — | `app/components/kudos/compose/image-upload.tsx` + test |
| 07 | Anonymous toggle + nickname | done | — | `app/components/kudos/compose/anonymous-toggle.tsx` + test |
| 08 | Compose dialog shell / orchestrator | done | 01,02,03,04,05,06,07 | `app/components/kudos/compose/compose-dialog.tsx` + test |
| 09 | KudosCard title line + KudosBanner trigger | done | 01 | `app/components/kudos/{kudos-card,kudos-banner}.tsx` (+ update their tests) |
| 10 | Page-client wrapper + page composition | done | 08,09 | `app/components/kudos/kudos-page-client.tsx` + test, `app/kudos/page.tsx` |
| 11 | Test + green gate | done | 10 | `tests/unit/kudos-compose.test.tsx` + full suite |

01·02·05·06·07 share no files → parallelizable. 03/04 need 01. 08 integrates fields.
09 (leaf additive) needs only 01. 10 composes 08+09. 11 last. No two phases touch the same file.

## Key dependencies / open items
- `CURRENT_USER` name should NOT collide with any existing sender/recipient name so the
  full distinct-people list stays available as recipients (exclusion is unit-tested with a
  crafted input instead). Phase 01 sets the value; Phase 03 consumes it.
- Title placement in `KudosCard`: render only when `post.title` truthy, between timestamp
  and content, accent style — additive, so `kudos-card.test.tsx`'s title-less post is unaffected.

## Phase files
- [phase-01-data-selector-type-layer.md](./phase-01-data-selector-type-layer.md)
- [phase-02-i18n-compose-namespace.md](./phase-02-i18n-compose-namespace.md)
- [phase-03-recipient-select.md](./phase-03-recipient-select.md)
- [phase-04-rich-text-editor.md](./phase-04-rich-text-editor.md)
- [phase-05-hashtag-input.md](./phase-05-hashtag-input.md)
- [phase-06-image-upload.md](./phase-06-image-upload.md)
- [phase-07-anonymous-toggle.md](./phase-07-anonymous-toggle.md)
- [phase-08-compose-dialog-shell.md](./phase-08-compose-dialog-shell.md)
- [phase-09-card-title-and-banner-trigger.md](./phase-09-card-title-and-banner-trigger.md)
- [phase-10-page-client-and-composition.md](./phase-10-page-client-and-composition.md)
- [phase-11-test-and-green-gate.md](./phase-11-test-and-green-gate.md)
</content>
</invoke>
