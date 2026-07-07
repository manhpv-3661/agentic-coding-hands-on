# Phase 03 — Fix Site Shell

**Priority:** P1 · **Status:** pending · **Effort:** 3h · **Depends on:** P2

## Context Links
- Rule: `.claude/rules/momorph/momorph-layout-system.md` §6.2 (shell before sections)
- P1 audit tables (header/footer heights, gutter, vertical rhythm)
- Files: `app/layout.tsx`, `app/globals.css`, `app/components/home/site-header.tsx`, `site-footer.tsx`

## Overview
Fix the chrome that renders on every screen (header, footer, root `<body>` wrapper, vertical
rhythm) so section/page phases inherit a correct frame. Header/footer are owned ONLY here — screens
render them but never edit them (prevents 3 screen phases fighting over one file).

## Key Insights
- `app/layout.tsx`: `<body className="min-h-full flex flex-col">` — shell wrapper. Fonts wired
  globally (Montserrat) already; do not re-wire.
- `site-header.tsx` uses `PageGutter` (now corrected by P2). Verify header height/padding vs P1.
- Vertical rhythm (gaps between sections) is a shell-level token per layout-system §2 — decide if
  it belongs in `globals.css` or per-section (KISS: keep per-section unless P1 shows one shell token).

## Requirements
- Header + footer gutter/height/padding match P1 numbers at 4 viewports.
- Body wrapper does not introduce a competing max-width or horizontal padding (single-owner rule).
- No double-gutter: header/footer use `PageGutter`; body wrapper stays gutter-free.

## Architecture / Data Flow
```
app/layout.tsx (body wrapper, no gutter)
  └─ site-header (PageGutter) ─┐
  └─ {page children}          ─┼─ inherit corrected primitive from P2
  └─ site-footer (PageGutter) ─┘
```

## Related Code Files
- Modify: `app/layout.tsx`, `app/globals.css`, `app/components/home/site-header.tsx`,
  `app/components/home/site-footer.tsx`
- Read: P1 audit, `app/fonts.ts`
- Create/Delete: none.

## Implementation Steps
1. Verify body wrapper adds no horizontal padding/max-width (single-owner). Fix if it does.
2. Align header gutter/height/nav spacing to P1 header numbers.
3. Align footer gutter/height/padding to P1 footer numbers.
4. If P1 defines one shell vertical-rhythm token, set it in `globals.css`; else leave per-section.
5. Lint + build; smoke home/awards/kudos (they all render the shell).

## Todo List
- [ ] Body wrapper gutter-free / max-width-free
- [ ] Header matches P1
- [ ] Footer matches P1
- [ ] Vertical rhythm decision recorded
- [ ] Lint/build green, chrome smokes on 3 pages

## Success Criteria
- Chrome numerically matches P1 on all 4 viewports; no competing container in the wrapper.

## Risk Assessment
- Header/footer render on multiple pages → a wrong value shows everywhere. Mitigation: P8 asserts
  header/footer geometry; verify before screens start.

## Security Considerations
None (presentational). i18n `lang` handling in `layout.tsx` must stay intact.

## Rollback
Revert the 4 shell files; screens are unaffected structurally (they only render chrome).

## Next Steps
Unblocks P4–P7 (screens run in parallel).
