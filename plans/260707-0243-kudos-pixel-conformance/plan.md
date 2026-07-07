---
title: "Kudos Pixel-Conformance Fixes (F006 + F007)"
description: "Cream restyle + Community Standards panel + Insert-link dialog + Secret Box visual, measured against MoMorph."
status: completed
priority: P2
effort: 16h
branch: main
work_type: feature
spec_draft: plans/260707-0243-kudos-pixel-conformance/spec/
tags: [kudos, pixel-conformance, momorph, restyle, i18n]
created: 2026-07-07
---

# Kudos Pixel-Conformance Fixes (F006 + F007)

Revision set for two shipped features, corrected against MoMorph ground truth measured this
session via `getComputedStyle`/`getBoundingClientRect` (not eyeballed screenshots — the mistake
that caused the earlier miss). Scope: 4 pixel/behavior fixes + integration.

- **F007** (`9ypp4enmFmdK3YAFJLIu6C`): FR-22 compose-dialog cream restyle (`ihQ26W78P2`),
  FR-23 Community Standards real panel (`b1Filzi9i6`), FR-24 Insert-link 2-field dialog (`OyDLDuSGEa`).
- **F006** (`J3-4YFIpMM`): FR-19-rev Secret Box dialog visual upgrade (logic unchanged — still no reward mechanic).

Spec: `spec/compose-form-momorph-conformance/`, `spec/secret-box-momorph-conformance/`.

## Phases

| # | Phase | Status | Effort | Depends on | Parallel-safe with |
|---|-------|--------|--------|-----------|--------------------|
| 1 | [i18n dictionary keys](phase-01-i18n-dictionary-keys.md) | completed | 2h | — | 2 |
| 2 | [Compose-dialog cream restyle (FR-22)](phase-02-compose-dialog-cream-restyle.md) | completed | 4h | — | 1, 5 |
| 3 | [Community Standards panel (FR-23)](phase-03-community-standards-panel.md) | completed | 4h | 1, 2 | 4, 5 |
| 4 | [Insert-link dialog (FR-24)](phase-04-insert-link-dialog.md) | completed | 2h | 1, 2 | 3, 5 |
| 5 | [Secret Box visual (FR-19-rev)](phase-05-secret-box-visual.md) | completed | 2h | 1 | 2, 3, 4 |
| 6 | [Integration & DoD](phase-06-integration-and-dod.md) | completed | 2h | 2, 3, 4, 5 | — |

## Dependency Graph

```
P1 (i18n) ──────┬──────────────┬───────────────┐
                │              │               │
P2 (restyle) ───┼───┬──────┐   │               │
   (no dep)     │   │      │   │               │
                ▼   ▼      ▼   ▼               ▼
             P3 (needs 1+2) P4 (needs 1+2)   P5 (needs 1)
                │      │                        │
                └──────┴───────────┬────────────┘
                                   ▼
                          P6 (needs 2,3,4,5)
```

Execution waves for the forge:
- **Wave 1:** P1 ∥ P2 (neither depends on the other).
- **Wave 2:** P5 starts once P1 done; P3 ∥ P4 start once P1 **and** P2 done.
- **Wave 3:** P6 after P2, P3, P4, P5 all green.

## Key Architectural Decisions

1. **Dedicated i18n foundation phase (P1).** FR-23, FR-24, FR-19 all add keys to the single
   monolithic `vi.ts`/`en.ts`. The hard rule "no two parallel phases touch the same file" forbids
   three phases editing those files concurrently. P1 adds every new key up front under distinct
   namespaces; P3/P4/P5 consume them read-only. This is the minimum coordination the shared file
   forces — not gold-plating. F006 (P5) stays parallel-executable with the F007 phases; it only
   shares the P1 prerequisite, not a live file.
2. **No cream-token extraction (YAGNI/KISS).** The codebase already inlines hex everywhere
   (`bg-[#101317]`, `text-[#FFEA9E]`). Cream `#FFF8E1` is applied the same way — inline Tailwind
   arbitrary values. Extracting a token/theme layer is premature for a 4-file restyle.
3. **File-cap splits happen inside the owning phase.** `compose-dialog.tsx` (284) and
   `rich-text-editor.tsx` (273) already exceed the 200-line cap and are both touched by P2 →
   P2 splits them (container/presenter for the dialog; caret helpers module for the editor).
4. **Sequential same-file sharing is allowed when declared.** `rich-text-editor.tsx` (P2 restyle
   → P3 panel wiring) and `rich-text-toolbar.tsx` (P2 restyle → P4 link button) are edited by two
   phases each, but always in dependency order — never in parallel. Declared in each phase's
   `Depends on`.

## Spec-vs-Code Corrections (carried into phases)

- **Field name:** spec drafts say `KUDOS_STATS.secretBoxesUnopened`; actual field is
  `secretBoxUnopened` (`lib/kudos/kudos-types.ts`, value 5). P5 uses the real name.
- **Count is not currently passed to the dialog:** `OpenGiftButton` receives only `labels`. P5
  threads `stats.secretBoxUnopened` through `kudos-stats-box.tsx` → `OpenGiftButton`.

## Global Constraints

- No new npm dependencies. Files < 200 lines (split otherwise). YAGNI / KISS / DRY.
- Every existing Vitest+RTL test stays green; new tests for every new/changed behavior.
- Do **NOT** touch `app/components/home/**`, `app/awards/**`, or unrelated dictionary keys.
- Verify pixels by real `getComputedStyle`/`getBoundingClientRect` in-browser vs MoMorph `get_node`
  — **not** by eyeballing thumbnails (P6 gate).
</content>
</invoke>
