---
stage: 5 (Master's Inspection)
plan: plans/260707-0243-kudos-pixel-conformance/plan.md
reviewer: reviewer agent
date: 2026-07-07
---

# Kudos Pixel-Conformance (F006 FR-19-rev, F007 FR-22/23/24) — Inspection

## Verification run (this session, not trusted from self-reports)

- `npx tsc --noEmit` — clean, 0 errors.
- `npx eslint app/components/kudos lib/kudos lib/i18n` — clean, 0 errors.
- `npx vitest run` — 483/483 passed, 78/78 files, 14.3s.
- `npx vitest run lib/i18n/dictionaries/parity.test.ts` — 4/4 passed (vi/en key-parity guard green; `Dictionary` type is `typeof vi`, and `en.ts` is `satisfies Dictionary`-checked, so tsc itself is a second structural parity gate).

All three release-gate commands match the expected 483/483, 0/0 state.

## Correctness — spec claims cross-checked against actual code

- **FR-22 cream restyle**: `compose-dialog.tsx` panel is `bg-[#FFF8E1] text-[#00101A]` (was `#101317`/white). Every field sub-component (`field-group`, `hashtag-input`, `image-upload`, `anonymous-toggle`, `recipient-select`, `rich-text-editor`) consistently moved to white inputs / `#00101A` text / `#998C5F` borders. Error text moved from `text-red-400` (invisible-ish on cream) to `font-semibold text-[#CF1322]` (dark red) everywhere it appears — checked all 6 occurrences, all consistent. Toolbar rebuilt with real inline-SVG icon buttons (`Bold/Italic/Strikethrough/List/Link/Quote`), every `aria-label` and `exec(...)` call preserved verbatim.
- **FR-23 Community Standards panel**: `community-standards-link.tsx` is a real `useDismissableMenu({haspopup:"dialog"})` trigger now (was a dead `<button>`). Panel renders 4 Hero tiers + 6 collection icons + national section, verified against `community-standards-content.ts` + dict content, and covered by 5 vitest cases (`community-standards-panel.test.tsx`) that individually assert each tier/icon/section text. **Notable, well-reasoned deviation from the phase brief**: the phase-03 file said "cream theme consistent with FR-22", but the shipped panel is the app's existing **dark** palette (`bg-[#00070C]`, gold `#FFEA9E` headings, white body) — the component doc comment explains this was corrected against a live `get_node`/`query_section` measurement of `b1Filzi9i6`, which returned `rgba(0,7,12,1)` surface, not cream. This is exactly the kind of "measure, don't eyeball" catch the whole plan exists to enforce — I can't independently re-query MoMorph from here, but the reasoning is documented, self-consistent, and the claim is falsifiable (a future MoMorph re-check will confirm/deny it) — logging as unresolved-but-non-blocking, not refuted.
- **FR-24 Insert-link dialog**: `window.prompt()` fully removed (`grep` confirms zero remaining call sites in kudos compose code — only comments/tests referencing its *absence* remain). `insert-link-dialog.tsx` is a controlled 2-field (Nội dung/URL) dialog; Save trims + requires URL, blank URL → inline error + dialog stays open + `exec` NOT called (asserted in both `insert-link-dialog.test.tsx` and `rich-text-toolbar.test.tsx`); Cancel calls nothing. `exec("createLink", url)` call site confirmed unchanged.
- **FR-19-rev Secret Box**: count claim `count = stats.secretBoxUnopened` verified end-to-end: `kudos-stats-box.tsx` passes `unopenedCount={stats.secretBoxUnopened}` (real field, not the spec-draft's incorrect `secretBoxesUnopened`) into `<OpenGiftButton>`; the dialog renders `{unopenedCount}` directly, no shadow/duplicate constant. Old plain-text "Đóng" button retired, replaced by a top-right `X` (`closeAria`) — matches `J3-4YFIpMM` per the code's own justifying comment. Open/close now goes through `useDismissableMenu`, so Escape parity holds (tested).

## Regressions — F007 FR-1..21

- Diffed every touched field component; changes are className/JSX-only except the two declared splits (`compose-dialog.tsx` → `compose-dialog-fields.tsx`, `rich-text-editor.tsx` → `rich-text-caret-helpers.ts`). No `aria-*`, `id`, validation, or handler wiring changed anywhere I diffed (`field-group`, `hashtag-input`, `image-upload`, `anonymous-toggle`, `recipient-select`, `rich-text-toolbar`).
- Caret-helpers extraction (`getCaretMentionToken`, `placeCaretAt`, `placeCaretAtEnd`, `MENTION_TOKEN_REGEX`) is a straight move plus one new pure fn (`computeMentionInsertion`) factored out of `handleMentionSelect`'s inline branching — behavior-preserving, confirmed by the untouched `rich-text-editor.test.tsx` staying green.
- Dead code check: `window.prompt` — zero remaining call sites. Old dark Secret Box markup — fully replaced, no leftover branch. Dict keys `gift.dialogTitle/dialogBody/close` are now **unreferenced** (the `OpenGiftButtonLabels` type dropped them entirely) but were deliberately left in the dict per Phase 1's own explicit decision ("P5 decides which stay used... note as retired for later cleanup") — flagging as a minor concern below, not a defect, since it was a declared plan decision, not an oversight.
- `linkPrompt` dict key: same story, declared-retired-but-kept, documented inline in `rich-text-toolbar.tsx`'s type comment.
- Draft-preservation (edge-case row 1) and Escape-topmost-only (edge-case row 2) are both backed by real tests, not just docstring claims — verified `useDismissableMenu`'s module-scoped `openMenuStack` genuinely gates Escape to the topmost instance, and traced that the compose dialog's own instance (in `kudos-page-client.tsx`) opens before the panel's, so the stack order the comment claims actually holds at runtime.
- Added a double-submit guard (`isSubmittingRef`) to `handleSubmit` — not in scope of any FR here, but harmless, tested (`fireEvent.click` twice synchronously → exactly one `onSubmit`), and doesn't touch the validate/aria contract BR-1 protects.

## File ownership / conflicts

No overlap issues found. `rich-text-editor.tsx` and `rich-text-toolbar.tsx` were each touched by two phases per the plan's own declared sequential-sharing rule (P2 restyle → P3/P4 wiring) — in both cases the second phase's diff is a single, surgical change (one prop-passing line each), consistent with "sequential, never parallel" as declared.

## Security (FR-24 stored-XSS check)

Traced the full data path: `rich-text-toolbar.tsx`'s `InsertLinkDialog.onSave` → `exec("createLink", url)` → `rich-text-editor.tsx`'s `exec()` → `document.execCommand("createLink", false, url)` (wrapped in try/catch) → `handleInput()` reads `el.textContent` only and calls `onChange(text)`. `KudosPost.content` is typed `string` (`lib/kudos/kudos-types.ts:26`). `innerHTML` is never read from the contentEditable region anywhere in this file. No stored-XSS surface — confirmed, not just asserted.

## Code quality

- All touched/new files under the 200-line cap except `compose-dialog.tsx` at **exactly 200** — the phase's own success criterion ("no file exceeds 200 lines") is met, but the house rule elsewhere says "under 200"; this is a 1-line-of-margin nitpick, not worth blocking on.
- `HeroTierRow`'s pill styling literally reuses `kudos-person-block.tsx`'s exact class string (`rounded-full border-[0.5px] border-[#FFEA9E] bg-[rgba(9,36,50,0.5)] px-2 py-0.5 text-[11.4px] font-bold text-white`) — verified byte-for-byte, good pixel-parity discipline instead of reinventing a similar-but-different pill.
- Dict vi/en key shapes checked directly (not just parity-test-trusted): `compose.content.toolbar.addLink`, `compose.communityStandards.{heroTiers[4], collectionIcons[6], ...}`, `gift.{heading,subtitle,unopenedCount,closeAria}` all present and shape-matched in both files.

## Spotlight-name-cloud.tsx (unrelated same-session fix)

Golden-angle spiral verified numerically (script run, not just read): computed `spiralSlot(i, total)` for total ∈ {12, 24, 50, 100, 200, 500} and diffed the rounded (1-decimal) `(top,left)` pairs — **zero collisions** at every N tested, including the exact N=24 case the old 12-slot table broke. The vertical clamp (`top` capped at 42%) leaves ~6% (~19px) of headroom below the largest anchored text's line-height before the ticker's measured start (~58%) — checked the arithmetic (24% + 20%×1 = 44% before clamp → 42% after; text-2xl line-height ≈ 10% of 320px), the reasoning holds, not just "looks right." The plan's own regression test (`spotlight-name-cloud.test.tsx`, N=24, asserts `Set(positions).size === names.length`) is real and passes.

## Findings

**Critical:** none.

**Concerns (non-blocking):**
1. `gift.dialogTitle` / `gift.dialogBody` / `gift.close` dict keys (vi+en) are now dead — no type or component references them. Declared-acceptable per Phase 1's own plan text, but should be swept in a follow-up cleanup pass so the dict doesn't accumulate untracked dead strings.
2. `compose.content.toolbar.linkPrompt` dict key is similarly dead post-FR-24. Same as above — documented, deferred, not an oversight.
3. FR-23's panel theme (dark, not cream) is a self-reported live-measurement correction to the phase brief that I could not independently re-verify against MoMorph from this environment (no MCP access here). The code's own reasoning is internally consistent and cites specific measured values (`rgba(0,7,12,1)`); flagging as an open item for whoever next has MoMorph access to spot-check, not as a refuted claim.

**Refinements (nice-to-have):**
1. `compose-dialog.tsx` is exactly 200 lines — one more extraction (or trimming a comment block) would clear the stricter "under 200" house rule with margin.
2. No dedicated unit test exercises the "no text selection" Insert-link path (edge-case row 3) end-to-end through the toolbar/editor combo — it's provably safe by code inspection (`exec` try/catches `execCommand` and jsdom already no-ops it in existing tests), but an explicit test would close the loop rather than relying on inspection.

## Verdict

Every FR claim I could check against actual code checked out; both static gates and the full test suite are clean and match the expected numbers; no dead-`window.prompt`, no leaked HTML/XSS surface, no broken FR-1..21 contract, no file-ownership collision. The two "concerns" are pre-declared, deferred cleanup items from the plan itself, not surprises found in review — this is the honest state, not a rubber stamp.

**Status:** DONE
**Score:** 9/10
**Critical:** none
**Concerns:** dead dict keys (`gift.dialogTitle/dialogBody/close`, `toolbar.linkPrompt`) left in place per plan's own deferred-cleanup decision; FR-23 dark-vs-cream theme correction is unverified against live MoMorph from this environment (reasoning is sound and documented, just not independently re-measurable here)
**Decision:** SEALED
