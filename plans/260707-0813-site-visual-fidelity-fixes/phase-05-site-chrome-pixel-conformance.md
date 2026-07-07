---
phase: 5
title: "Site chrome pixel conformance (header + footer)"
track: A
status: pending
priority: P1
effort: 2h
depends_on: []
parallel_safe_with: [1, 2, 3, 4, 6]
screen: "Header/footer regions of i87tDx10uM (shared across all pages)"
file_ownership:
  - app/components/home/site-header.tsx
  - app/components/home/site-footer.tsx
  - app/components/home/nav-link.tsx
  - app/components/home/account-menu-button.tsx
  - app/components/home/notification-bell.tsx
  - "app/components/home/site-header.test.tsx"
  - "app/components/home/site-footer.test.tsx"
---

# Phase 5 — Site Chrome Pixel Conformance

## Context Links

- Method: `references/measurement-method.md`.
- Header node `2167:9091` (mms_A1_Header); footer within `i87tDx10uM`.
- Chrome renders on home, awards, AND kudos — carved into ONE phase so no page-audit phase edits it.

## Overview

- **Priority:** P1 — the header/footer are on every screen; drift multiplies across the site.
- Measure the sticky header (logo, nav links, language/notification/account cluster) and the footer
  against ground truth; close each Δ. `LanguageSelector` lives under `app/login/components` —
  read-only here (not chrome-owned).

## Requirements

- Diff tables for header (`site-header` + `nav-link`, `account-menu-button`, `notification-bell`)
  and `site-footer`. Every tracked box-model + type property Δ === 0.
- Preserve the responsive gutter scale (`px-6 sm:px-10 lg:px-36`) and the active-route logic in
  `site-header` — style only.
- Flag flow-driven heights `RE-VERIFY@P7`.

## Architecture

- Presentational Tailwind adjustments; keep `usePathname()` active-link derivation and the
  `useScrollToTopOnHomeClick` behavior intact.
- Header `background: rgba(16,20,23,0.8)` + `sticky top-0 z-20` are ground-truth-checked, not assumed.

## Related Code Files

- **Modify:** the `file_ownership` list (className/JSX spacing only).
- **Read for context:** `app/login/components/language-selector.tsx` (rendered, not owned),
  `references/measurement-method.md`.
- **Delete:** none.

## Implementation Steps

1. `get_node 2167:9091` + footer node(s); map logo/nav/cluster/footer columns.
2. Per element: diff table → fix Δ → re-measure to Δ 0 (check across sm/lg breakpoints).
3. Update only style-coupled assertions in `site-header.test.tsx` / `site-footer.test.tsx`.
4. `npx tsc --noEmit` + `npx eslint app/components/home/site-header.tsx app/components/home/site-footer.tsx` + `npx vitest run app/components/home/site-header.test.tsx app/components/home/site-footer.test.tsx`.

## Todo List

- [ ] header node map (logo, nav links, right cluster)
- [ ] header Δ 0 across sm/lg
- [ ] footer Δ 0
- [ ] active-route + scroll-to-top behavior preserved
- [ ] flow-driven heights flagged RE-VERIFY@P7
- [ ] tsc + eslint + vitest green

## Success Criteria

- Header + footer nodes match `get_node` (Δ 0). Active-link highlight + logo scroll-to-top still work.
- `site-header`/`site-footer` tests pass (only style-coupled assertions changed).
- Chrome renders identically on home, awards, and kudos (P7 confirms cross-page consistency).

## Risk Assessment

| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| Breaking active-route logic while restyling nav | Low | High | Style-only diffs; existing header test guards it |
| Responsive gutter regressions at sm/lg | Med | Med | Measure at both breakpoints, not just lg |
| Touching `language-selector` (login-owned) | Low | Med | Read-only; do not edit |

## Security Considerations

None — presentational; no auth/route logic changed.

## Next Steps

Feeds P7 — the cross-page chrome-consistency check depends on this being the sole chrome editor.
</content>
