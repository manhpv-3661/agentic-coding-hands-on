# doc-writer: F002 Homepage docs impact review

## Files reviewed
- docs/features/f002-homepage/feature.md
- docs/system/permissions.md
- docs/system/architecture.md
- docs/features/f001-login/feature.md (precedent/cross-ref only)
- proxy.ts, app/auth/callback/route.ts, app/awards/page.tsx, app/kudos/page.tsx,
  lib/event-countdown.ts, app/components/home/account-menu-button.tsx(+.test.tsx),
  .env.local.example (ground truth spot-checks)

## Files updated
- **docs/system/architecture.md** (surgical, forward-authored Cap.A prose — patch-within-section only):
  - "Thành phần chính" route list: added `app/page.tsx` (Homepage, post-login target),
    `app/awards/page.tsx` + `app/kudos/page.tsx` (protected placeholders); reworded `app/todo/page.tsx`
    as no-longer-post-login-target; `app/auth/callback` redirect target `/todo` → `/`.
  - `proxy.ts` bullet: matcher literal updated `["/todo/:path*","/login"]` → `["/","/awards","/kudos","/todo/:path*","/login"]`.
  - "Luồng dữ liệu xác thực" ASCII diagram: redirect target and proxy auth-flow line updated `/todo` → `/`,
    protected-route list expanded to `/, /awards, /kudos, /todo`.
  - "Câu hỏi mở": expanded from `/todo` only to `/todo, /awards, /kudos` (all still placeholder content).
  - Headings/structure untouched; no full rewrite.

## No changes needed
- **docs/system/permissions.md** — already correct from F002 planning: route matrix includes `/`, `/awards`,
  `/kudos` alongside `/todo`, post-login target `/`, proxy matcher list, sign-out flow, open-redirect note —
  all verified against current `proxy.ts` / `route.ts` source, matches exactly.
- **docs/features/f002-homepage/feature.md** — spot-checked FR-1..FR-5 (access control) against `proxy.ts`
  `isProtectedPath`/matcher, FR-3/FR-4 against `route.ts` default `next="/"`, FR-10 (Profile stub/Sign out
  real/Admin Dashboard hidden) against `account-menu-button.tsx` + its test, FR-12..FR-15 (countdown
  zero-pad/invalid-env/zero-state) against `lib/event-countdown.ts`, FR-13 env var name against
  `.env.local.example`. All match shipped code — no drift found, no edit made.

## Advisory (non-blocking, out of scope — not edited)
- `docs/features/f001-login/feature.md` FR-2/FR-4/FR-7 and its flow diagram still say post-login /
  post-logout-guard target is `/todo` (accurate as of F001, now superseded by F002's `/`). Not in this
  task's file list, so left untouched. Recommend a follow-up surgical patch to F001's feature.md
  cross-referencing F002's redirect-target change, or defer to next `rebuild-spec` Core pass.

## Verdict
Updated 1 file (docs/system/architecture.md). No changes needed in 2 files (permissions.md, f002 feature.md).

**Status:** DONE
**Summary:** Reconciled docs/system/architecture.md's stale auth-flow (post-login target `/todo`→`/`, added `/`,`/awards`,`/kudos` as protected routes) via surgical patch-within-section edits; verified permissions.md and f002 feature.md already match shipped code with no drift.
