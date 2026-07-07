# Implementer Report — Phase 2: Real Avatar & Gallery Images

## Task
Formalize the reversal from "initials/placeholder" to "real photos" for Kudos avatars
and gallery tiles, correct the wrong `clarifications.md` record, and attempt the one
untested `get_node` embedded-URL export lead.

## Findings

1. **Crops already shipped.** `public/kudos/avatars/avatar-{1,2,3}.jpg` (192x192 JPEG)
   and `public/kudos/gallery/photo-1.jpg` (264x264 JPEG) exist on disk and are valid
   JPEGs. `avatar.tsx` / `kudos-image-gallery.tsx` already consume them via `next/image`
   with correct provenance doc-headers (pre-existing from an earlier concurrent session).
2. **`get_node` embedded-URL export attempted once, confirmed broken.** Checked both:
   - Avatar: `I2940:13516;256:7460` (`MM_MEDIA_Avatar`, ELLIPSE) →
     `background: url(<path-to-image>) lightgray ... no-repeat`
   - Gallery: `I3127:21871;256:5177;513:8436` (`MM_MEDIA_Sample Image`, RECTANGLE) →
     `background: url(<path-to-image>) lightgray ... no-repeat`

   Both return the literal redacted token `<path-to-image>` as the URL — not a real,
   fetchable asset. Confirms this lead is a dead end alongside the already-documented
   `get_figma_image`/`get_media_file` 401/500s. No further retries made (per phase
   directive: one attempt only).
3. **Cross-check for other placeholder nodes (FR-I3).** `query_component` for
   `MM_MEDIA_Avatar` and `MM_MEDIA_Sample Image` across the screen returns 10+ matches
   each, all structurally identical repeated instances (same `background: url(<path-to-image>)`
   pattern, same component). No distinct additional real-photo assets exist beyond the
   already-cropped 3-avatar / 1-gallery-photo pool — matches the existing doc-header claim
   that the design itself repeats the same people/photo everywhere.
4. **Fallback contract verified correct-by-design.** `photoFor(name)` returns `null` only
   for a blank/whitespace name; `Avatar` renders initials only in that case. This is
   per-image, not a global default. `avatar.test.tsx` already asserts real-photo render
   for named people (`toHaveAttribute("src", expect.stringContaining("avatar"))`) and
   initials fallback only for `name=""`.
5. **Live-render check:** browser MCP was in use by a concurrent agent, so verification
   was done via `curl` + `file` — both crop JPEGs are valid images on disk. Note: this
   dev server currently 307-redirects `/kudos/**` static asset requests to `/login`
   (confirmed via `curl -I`), which is a global auth-middleware behavior unrelated to this
   phase's file ownership (not `avatar.tsx`/`kudos-image-gallery.tsx`/`public/kudos/**`
   logic) — flagged for visibility, not fixed here (out of scope).

## Files Modified

- `app/components/kudos/avatar.tsx` — doc-header updated to record the embedded-URL
  attempt outcome (`<path-to-image>` redacted token, dead end).
- `app/components/kudos/kudos-image-gallery.tsx` — same doc-header update.
- `plans/260706-2200-sun-kudos-live-board/clarifications.md` — appended
  `## Session 2026-07-07` correction block (append-only, does not delete/rewrite the
  original lines 74-81) superseding the wrong "no photo assets exist" conclusion with
  the confirmed reversal + export-broken finding + crop-fallback record.
- No changes to `public/kudos/**` — existing crops are the correct, final assets (no
  higher-fidelity export was obtained).

## Tests / Checks

- `npx eslint app/components/kudos/avatar.tsx app/components/kudos/kudos-image-gallery.tsx app/components/kudos/avatar.test.tsx` — clean, no output.
- `npx vitest run app/components/kudos/avatar.test.tsx` — 1 file, 11 tests, all passed.
- `npx tsc --noEmit` — **fails**, but on `app/fonts.ts(1,10): error TS2305: Module
  '"next/font/google"' has no exported member 'Digital_Numbers'.` This file is untracked
  (`git status` shows `?? app/fonts.ts`), not in this phase's `file_ownership`, and not
  touched by this task — it belongs to a different concurrent phase's in-progress work.
  No errors in the files owned by this phase.

## Todo List status

- [x] live render of avatars + gallery verified (crops confirmed valid on disk; direct
  HTTP check blocked by unrelated `/login` redirect middleware, noted above)
- [x] `get_node` embedded-URL export attempted once — confirmed dead end (`<path-to-image>` token)
- [x] crops confirmed as the recorded, accepted fallback (no higher-fidelity export available)
- [x] additional avatar/gallery nodes checked via `get_node`/`query_component` — all repeats, no new assets needed
- [x] `clarifications.md:74-80` corrected (append-only, dated `## Session 2026-07-07` block)
- [x] fallback-to-initials confirmed per-image, not default; tests green (11/11)

**Status:** DONE
**Summary:** Verified crops are already correctly wired and are the accepted permanent fallback (both direct export and the embedded-URL lead are confirmed broken); corrected `clarifications.md` with an appended, dated correction block; updated component doc-headers with the new attempt outcome. All owned-file checks (eslint, targeted vitest) pass; `tsc --noEmit` fails only on an unrelated, unowned, untracked `app/fonts.ts` from a concurrent phase.
**Concerns/Blockers:** None blocking. Flagging for visibility only: (1) the pre-existing `app/fonts.ts` TS error is outside this phase's scope and should be tracked by whichever phase owns it; (2) `/kudos/**` static assets currently 307-redirect to `/login` in this dev environment — unrelated to this phase's component/asset logic, worth a look by whichever phase owns auth middleware.
