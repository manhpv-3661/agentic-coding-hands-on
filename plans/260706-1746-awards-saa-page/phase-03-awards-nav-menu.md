# Phase 03 — Vertical nav menu (`awards-nav-menu`)

## Context Links
- Spec: FR-6, FR-7, FR-8, FR-9, FR-10
- Data: `lib/awards/award-categories.ts` (6 items, order + slug/title)
- Pattern refs: `app/components/home/nav-link.tsx` (active/selected styling, `aria-current`), `award-card.tsx` (inline SVG w/ currentColor)
- Test pattern: `app/components/home/nav-link.test.tsx`

## Overview
- **Priority:** P2 · **Status:** done
- Client component: vertical list of the 6 categories with a Target leading icon.
  Active item (gold `#FFEA9E` + underline) is driven by an `activeSlug` **prop**
  (supplied by the catalog's scroll-spy in Phase 05) — the menu does NOT own the
  hook, keeping it prop-driven and unit-testable in isolation.

## Key Insights
- Click-to-scroll uses native anchor `href="#<slug>"` + smooth scroll — per the
  clarification, NO separate "pinned" click-state: after click the observer
  naturally settles the active item. This also makes hash-anchor from Homepage
  (`/awards#<slug>`) work for free.
- Enable smooth scroll via `scroll-smooth` on the scroll container / `html`
  (Phase 05 wires the offset with `scroll-mt` on the sections).
- Active recolor: color the label gold + underline; Target icon may use
  `currentColor` (inline SVG) so it tints with the active label, OR stay a static
  `<img>` — implementer judgment, prefer inline SVG for the tint (FR-8).

## Requirements
- **Functional:** render `AWARD_CATEGORIES` in order (FR-6), each an `<a href="#slug">` with Target icon + title. `activeSlug` prop → active item gets gold+underline + `aria-current="true"` (FR-8, a11y). Hover on non-active → subtle highlight (FR-9). Click scrolls to the section (native anchor) (FR-7). Unknown/absent activeSlug → nothing active, no throw (FR-10).
- **Non-functional:** `"use client"` only if it needs interactivity — it does not (pure anchors + prop). Keep it a plain component (no client hook) UNLESS Phase 05 needs onClick handlers; prefer stateless. `focus-visible` styling. File <150 lines, Montserrat scoped.

## Architecture
Props: `{ items: {slug,title}[]; activeSlug: string | null }`. Renders `<nav aria-label="Award categories"><ul>` of anchors. Pure function of props → deterministic, trivially testable. Sticky positioning (`lg:sticky lg:top-24`) applied by Phase 05 wrapper or here — keep the sticky class here on the `<nav>` for cohesion.

Data flow: catalog passes `activeSlug` (from scroll-spy) + `AWARD_CATEGORIES` → menu renders highlight + anchors.

## Related Code Files
- **Create:** `app/components/awards/awards-nav-menu.tsx`
- **Create:** `app/components/awards/awards-nav-menu.test.tsx`
- **Read for context:** `nav-link.tsx`, `lib/awards/award-categories.ts`
- **Asset:** `public/awards-saa/Icon-Target.svg` (inline or `<img>`)

## Implementation Steps
1. Component takes `items` + `activeSlug`. Map to `<a href={"#"+slug} aria-current={slug===activeSlug || undefined}>` with Target icon + title.
2. Active class: `text-[#FFEA9E] underline` when `slug===activeSlug`; else default + `hover:` highlight + `focus-visible:` ring.
3. Inline Target SVG with `currentColor` (from `public/awards-saa/Icon-Target.svg`) so the icon tints with the active label.
4. Scoped Montserrat + `mm:` comments for the menu node.

## Todo List
- [x] `awards-nav-menu.tsx`
- [x] Test: renders 6 items in AWARD_CATEGORIES order with `href="#<slug>"`
- [x] Test: `activeSlug` item has `aria-current` + gold/underline class; others do not
- [x] Test: `activeSlug={null}` / unknown → no active, no throw
- [x] `npx tsc --noEmit` + vitest run

## Success Criteria
- 6 anchors, correct order + hrefs; exactly one active reflects `activeSlug`.
- a11y: `aria-current` on active, focus-visible present.
- Type-checks; tests green.

## Risk Assessment
- **Click vs observer race (Low/Low):** resolved by design — no pinned state; anchor scroll + observer settle is the agreed behavior (clarification). No mitigation needed.
- **Sticky offset under sticky header (Low/Med):** header is `sticky top-0 min-h-20`; set nav `lg:top-24` and section `scroll-mt-24` (Phase 05) to clear it.

## Security Considerations
- None — static anchors, no user input.

## Next Steps
- Consumed by Phase 05 (`awards-catalog.tsx`) which supplies `activeSlug`.
</content>
