---
phase: 2
title: "Real avatar & gallery images (formalize reversal)"
track: B
status: pending
priority: P1
effort: 2h
depends_on: []
parallel_safe_with: [1, 3, 4, 5, 6]
file_ownership:
  - app/components/kudos/avatar.tsx
  - app/components/kudos/kudos-image-gallery.tsx
  - public/kudos/**
  - plans/260706-2200-sun-kudos-live-board/clarifications.md
  - app/components/kudos/avatar.test.tsx
---

# Phase 2 — Real Avatar & Gallery Images

## Context Links

- Research: image-export root-cause report (this session) — single-node MoMorph export
  (`get_figma_image`/`get_media_file`) is **structurally broken (401/500)** for file
  `9ypp4enmFmdK3YAFJLIu6C`, across 5+ nodes/2 screens; crop-from-full-render is the proven fallback
  and is ALREADY in place. `list_media_nodes` is stale/unreliable (caused the wrong "no photos"
  conclusion) — verify fills with `get_node`, not `list_media_nodes`.
- Wrong record to correct: `plans/260706-2200-sun-kudos-live-board/clarifications.md:74-80`.
- Current state: `avatar.tsx` already renders `/kudos/avatars/avatar-{1,2,3}.jpg` with a
  deterministic hash + initials fallback; `kudos-image-gallery.tsx` renders `/kudos/gallery/photo-1.jpg`.

## Overview

- **Priority:** P1 — user explicitly reversed the "use initials/placeholder" decision.
- The reversal is **largely implemented** already. This phase **formalizes** it: correct the record,
  attempt the one untested higher-fidelity export path, keep the proven crop fallback otherwise,
  and guarantee initials-fallback is per-missing-image only (never the default). Do NOT re-litigate
  the reversal — implement it.

## Key Insights

- Do NOT burn calls re-trying `get_figma_image`/`get_media_file` — 5-for-5 documented failures.
- **One untested lead:** `get_node` responses embed `background: url(...)` for avatar/gallery nodes.
  No prior session tried fetching that URL directly. If MCP is available and that URL is live,
  it yields higher fidelity than a hand-crop. Try it **once**; on failure, keep the existing crops.
- Real photos already ship — the visible defect the user sees may be low crop fidelity OR the
  fallback triggering where it shouldn't. Verify actual render on the live board before assuming
  new assets are needed.
- `avatar.tsx` fallback is correct-by-design (initials only when `photoFor(name)` returns null for a
  blank/anonymous name) — preserve that contract; do not make initials the default.

## Requirements

- **FR-I1:** `clarifications.md:74-80` corrected — replace the "no photo assets / render initials"
  and "generic placeholder tile" answers with the confirmed reversal: real photos via crops
  (export broken), initials/empty only as per-missing fallback. One-line-per-decision format
  (`.claude/templates/plans/clarifications.md`); add under a new `## Session 2026-07-07` block,
  do not silently rewrite history — append the correction with a note referencing this plan.
- **FR-I2:** Attempt the `get_node` embedded-URL export once (if MCP available); if it yields clean
  assets, replace the crops and note provenance in the component header. If it fails, keep crops
  and record the attempt outcome.
- **FR-I3:** Enumerate any OTHER avatar/gallery nodes still showing placeholders by cross-checking
  `get_node` fills (not `list_media_nodes`); crop any confirmed-but-missing ones.
- **FR-I4:** Fallback-to-initials (avatar) / render-nothing (gallery `count===0`) stays per-image,
  never the global default.

## Architecture

- No structural change to `avatar.tsx` / `kudos-image-gallery.tsx` — they already consume real
  photo paths via `next/image`. Changes are limited to: asset files under `public/kudos/**`,
  photo-pool constants if new crops are added, and doc-header provenance notes.
- Data flow unchanged: `name → hashSum → photoFor → <Image src>`; gallery `count → tiles → <Image>`.

## Related Code Files

- **Modify:** `app/components/kudos/avatar.tsx` (header/provenance + pool only if new assets),
  `app/components/kudos/kudos-image-gallery.tsx` (same), `clarifications.md`
- **Create/replace:** `public/kudos/avatars/*.jpg`, `public/kudos/gallery/*.jpg` (only if better
  assets obtained)
- **Read for context:** image-export research report; `app/components/kudos/kudos-banner.tsx`
  (KV background — same failure mode, do NOT touch, owned by P6)
- **Delete:** none

## Implementation Steps

1. Run the app; verify how avatars + gallery actually render on `/kudos` — capture whether real
   photos show or the fallback triggers unexpectedly.
2. If MCP available: `get_node` on avatar `2940:13516` + gallery `I3127:21871;256:5177;513:8436`;
   attempt to fetch the embedded `background:url(...)` once. Record result.
3. If higher-fidelity assets obtained → replace crops in `public/kudos/**`, update pool + provenance
   header. Else keep existing crops and document the confirmed-broken export.
4. Cross-check `get_node` for any additional placeholder-looking avatar/gallery nodes; crop if
   confirmed real-but-missing.
5. Correct `clarifications.md:74-80` per FR-I1 (append `## Session 2026-07-07` correction block).
6. `npx tsc --noEmit` + `npx eslint app/components/kudos` + `npx vitest run app/components/kudos/avatar.test.tsx`.

## Todo List

- [ ] live render of avatars + gallery verified
- [ ] `get_node` embedded-URL export attempted once (or noted MCP-unavailable)
- [ ] higher-fidelity assets swapped in OR crops confirmed as the recorded fallback
- [ ] additional missing avatar/gallery nodes checked via `get_node` + cropped if needed
- [ ] `clarifications.md:74-80` corrected (append-only, dated block)
- [ ] fallback-to-initials confirmed per-image, not default; tests green

## Success Criteria

- `/kudos` renders real photos for avatars + gallery (not initials/placeholder tiles) for all named
  mock people.
- `clarifications.md` no longer claims "no photo assets exist"; the reversal + export failure are
  recorded accurately.
- Anonymous/blank-name avatar still falls back to initials (test asserts `photoFor("") === null`).
- Existing avatar/gallery tests stay green; a test asserts real-photo render for a named person.

## Risk Assessment

| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| Chasing the broken export wastes effort | Med | Med | One `get_node`-URL attempt only, then stop — crops are the accepted fallback |
| Silent revert to placeholders | Low | High | FR-I4 + a test asserting real-photo render for a named person |
| Crop fidelity still looks off to PO | Med | Med | Try the `get_node` embedded URL first; if still poor, report back — do not silently accept |
| Rewriting clarifications loses history | Low | Low | Append a dated correction block, don't delete the old lines |

## Security Considerations

Static public assets only. No external image fetch at runtime (all local under `public/`).

## Next Steps

Parallel-safe with all. P7 confirms images render correctly under the global font + across the board.
If no viable higher-fidelity export exists, that outcome is reported (not silently reverted).
</content>
