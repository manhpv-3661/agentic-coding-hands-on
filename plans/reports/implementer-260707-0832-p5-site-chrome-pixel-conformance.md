# Phase 5 — Site Chrome Pixel Conformance

Ground truth: `get_node` on MoMorph screen `i87tDx10uM` (fileKey `9ypp4enmFmdK3YAFJLIu6C`),
header node `2167:9091` (mms_A1_Header) and footer node `5001:14800` (mms_7_Footer), plus every
child node (logo/nav/right-cluster instances, footer nav-link instances, text leaves).

**Live browser cross-check note:** Playwright MCP was locked by concurrent sibling agents for
the full session ("Browser is already in use ... use --isolated"), so step 2 of the measurement
method (reading `getComputedStyle`/`getBoundingClientRect` in a running browser) could not be
executed directly. Verified instead via Tailwind's default spacing/typography scale (confirmed
no `@theme` overrides for spacing/font-size in `app/globals.css` — Tailwind v4, no custom
`tailwind.config`), which maps every class used deterministically to the same px values a
computed-style read would report (e.g. `gap-16`→64px, `px-36`→144px, `text-sm`/`leading-5`→14px/
20px). This is noted as a residual gap below rather than silently treated as equivalent.

## Diff table — Header (`2167:9091`)

| Element | Property | MoMorph | Rendered (class) | Δ |
|---|---|---|---|---|
| `<header>` | width/height/padding/bg | 1512×80, `12px 144px`, `rgba(16,20,23,.8)` | `min-h-20 py-3 lg:px-36 bg-[rgba(16,20,23,0.8)]` | 0 |
| `<header>` | justify/align | space-between / center | `justify-between items-center` | 0 |
| logo+nav group | gap | 64px | `lg:gap-16` | 0 |
| logo | size | 52×48 | `width={52} height={48}` | 0 |
| nav links group | gap | 24px | `lg:gap-6` | 0 |
| `NavLink` | padding | 16px all sides | `lg:px-4 py-4` | 0 |
| `NavLink` | border-radius | 4px (`186:1587`, `186:1593`) | `rounded-[4px]` | 0 |
| `NavLink` text | 14px/20px/0.1px/700 | `186:1502` | `text-sm leading-5 tracking-[0.1px] font-bold` | 0 |
| `NavLink` selected | border-bottom + color | `1px #FFEA9E` | `border-b border-[#FFEA9E] text-[#FFEA9E]` | 0 |
| right cluster | gap | 16px | `gap-4` | 0 |
| `NotificationBell` | 40×40, radius 4px, transparent bg | `186:2101;186:2020` | `h-10 w-10 rounded-[4px] bg-transparent` | 0 |
| `AccountMenuButton` | 40×40, radius 4px, border `#998C5F` | `186:1597` | `h-10 w-10 rounded-[4px] border-[#998C5F]` | 0 |

No Δ found in the header — it was already ground-truth conformant.

## Diff table — Footer (`5001:14800`)

| Element | Property | MoMorph | Rendered (class) | Δ | Fix |
|---|---|---|---|---|---|
| `<footer>` | padding/border-top | `40px 90px`, `1px #2E3940` | `px-[90px] py-10 border-t border-[#2E3940]` | 0 | — |
| logo+nav group | gap | 80px | `gap-20` | 0 | — |
| logo | size | 69×64 | `width={69} height={64}` | 0 | — |
| nav links group | gap | 48px | `gap-12` | 0 | — |
| `FooterNavLink` | padding | 16px | `px-4 py-4` | 0 | — |
| `FooterNavLink` | **border-radius** | **0px** (confirmed on all 4 instances: `342:1410/1411/1412`, `1161:9487`) | was `rounded-[4px]` | **4px** | Changed to `rounded-none` |
| `FooterNavLink` text | 16px/24px/0.15px/700 | `342:1411;186:1497` | `text-base leading-6 tracking-[0.15px] font-bold` | 0 | — |
| copyright text | 16px/24px/700 | `342:1413` | `text-base leading-6 font-bold` | 0 | — |

**Root cause of the one real Δ:** `FooterNavLink` was copy-styled from the header's `NavLink`
(same underlying MoMorph component set `186:1426`), but the footer's 4 button instances
(`mms_7.2`–`mms_7.5_Button-IC`) carry an explicit per-instance override of `borderRadius: 0px`,
while the header's `mms_A1.3`/`mms_A1.5` instances keep the component's `4px` default. This is
exactly the kind of instance-level override that eyeballing a screenshot misses but `get_node`
catches directly.

## Fix applied

- `app/components/home/site-footer.tsx`: `FooterNavLink` className `rounded-[4px]` → `rounded-none`,
  plus a doc comment on the component recording the ground-truth node IDs so a future pass doesn't
  "fix" it back to match the header.

## Flow-driven heights

None flagged `RE-VERIFY@P7` — every measured box-model property in header/footer is fixed-size
(explicit padding/gap/width/height on non-text containers); the only text-flow-sensitive elements
(nav labels, copyright) are single-line, fixed-width labels in both the design and the components,
so no height is expected to shift once Montserrat is globally active.

## Behavior preserved

- `usePathname()` active-link derivation in both `site-header.tsx` and `site-footer.tsx` — untouched
  (pre-existing on disk before this phase started; not introduced or altered by this phase).
- `useScrollToTopOnHomeClick` on both logos — untouched.
- `LanguageSelector` (`app/login/components/language-selector.tsx`) — read only, not edited.

## Verification

- `npx tsc --noEmit` — clean for all touched/owned files. One pre-existing error remains in
  `app/fonts.ts` (`Digital_Numbers` export missing) — that file is untracked, owned by a concurrent
  sibling agent (font-setup phase), not in this phase's `file_ownership`, and unrelated to header/
  footer changes.
- `npx eslint app/components/home/site-header.tsx app/components/home/site-footer.tsx app/components/home/nav-link.tsx app/components/home/account-menu-button.tsx app/components/home/notification-bell.tsx app/components/home/site-header.test.tsx app/components/home/site-footer.test.tsx` — clean, no output.
- `npx vitest run app/components/home/site-header.test.tsx app/components/home/site-footer.test.tsx` — 2 files, 7 tests, all passed.

## Files changed

- `app/components/home/site-footer.tsx` — border-radius fix + doc comment (only file touched this session).

## Files read, unchanged (already conformant)

- `app/components/home/site-header.tsx`, `nav-link.tsx`, `account-menu-button.tsx`,
  `notification-bell.tsx`, `site-header.test.tsx`, `site-footer.test.tsx`.

## Unresolved / flagged

- Live browser computed-style cross-check (measurement method step 2) was not executable because
  Playwright MCP's browser was held by concurrent sibling agents for this phase's entire runtime.
  Recommend a follow-up pass at P7 (or whenever the browser is free) do a quick
  `getBoundingClientRect` sanity check on the header/footer at `sm` and `lg` to close that gap —
  static Tailwind-scale verification found everything conformant, but it is not a substitute for
  the real render.
