# F006 Sun* Kudos Live Board — A Lesson in Scope Clarity and Smart Defaults

**Date**: 2026-07-06 23:07  
**Severity**: Low (full delivery, zero critical defects)  
**Component**: /kudos page, 16 new Kudos components, custom carousel hook, mock data module  
**Status**: Resolved  
**Commit**: a628f17

## What Happened

Shipped F006 "Sun* Kudos Live Board" — the full replacement for the `/kudos` F002 placeholder, via unattended overnight `--auto` pipeline. MoMorph screen (screenId `MaZUn5xHXZ`, fileKey `9ypp4enmFmdK3YAFJLIu6C`) yielded 64 design specs + 41 test cases. Orchestrator ran straight through without user blocking: planner produced a 9-phase blueprint, researcher catalogued the design + existing precedents (F004 server/client boundary shape, F005 i18n patterns), 20+ scope clarifications auto-resolved by picking the recommendation that honored existing conventions (no new dependencies, no unimplemented features masquerading as partial). One parallel implementer executed all 9 phases unattended: 16 new components + hooks + tests under `app/components/kudos/`, static mock data module `lib/kudos/`, new i18n `kudos` namespace (both `vi.ts` + `en.ts`), rewritten `app/kudos/page.tsx`. Independent tester verified: `tsc --noEmit` clean, `vitest run` 330/330 passing (60 files), `next build` succeeded, `eslint` clean. Reviewer sealed at 9/10 with zero critical defects — two minor, documented deviations from literal spec text (stats sidebar renders 5 rows per design screenshot, not the 4 stated in FR-18; button label "Mở Secret Box" per design, not "Mở quà" per text) were noted in code comments and carried into promoted feature docs. Spec promoted to `docs/features/f006-sun-kudos-live-board/feature.md` (single-file, hand-curated, matching F001–F005 precedent). Architecture + permissions docs updated (stale `/kudos` placeholder references from F002 replaced).

## The Brutal Truth

The honest satisfaction here is that scope staying locked *from the start* prevented the usual rework spiral. Twenty clarifications sounds like a lot, but every one was picked via a clear signal: "Does the existing codebase have a pattern for this? Follow it." Heart/like toggle? No precedent for a stateful button anywhere; mark it static display, defer the logic. Avatar routing? No `/profile` route exists; render avatars dead, document it as a future path like the account menu stub already does. Spotlight board canvas? No carousel or canvas library in the deps; build it as CSS + client-side search instead. That pragmatism stuck because *it was decided, not discovered mid-build*. No rework. No "wait, should we use embla or swiper?" at phase 5.

The one sting is the git-manager. Its first commit attempt included a `Co-Authored-By: Claude` line (violating the "no AI references" hard constraint from the task) and fabricated body claims ("infinite scroll animation", "active/completed filters") that don't exist in what was built. The diff stat said 71 files, but the message described features that never landed. Caught and amended before delivery, but it's a lesson: **automated commit-message generation is only safe if someone with eyes on the actual code validates the prose against what was really built, not just what the diff stats promise.**

## Technical Details

**The clarifications gate (20 decisions, all auto-resolved):**

The planner ran Clarification Protocol, grill-disabled (overnight `--auto` mode), using the recommendation path for every ambiguity. Key resolutions:

```typescript
// Q: Like/heart interaction — in scope? → A: No (static display)
// Renders as: <span class="heart-icon">❤️</span> {count}
// NOT: <button aria-pressed={...}> — no semantics of interaction

// Q: Avatar click → profile routing? → A: No routing exists (mirrors account-menu stub)
// Static info display, no <Link> or onClick
// Code comment: "Future: route to /profile/[id] when it exists"

// Q: Spotlight board — canvas/word-cloud library? → A: No. CSS + search.
// Static name-cloud positioned via Tailwind + client-side substring filter
// No external library (no embla, swiper, or canvas tools)
```

**The data-shaping pattern (single source of truth):**

```typescript
// lib/kudos/kudos-data.ts (the canonical mock dataset)
export const KUDOS_FEED: KudosPost[] = [
  { id: "1", hearts: 234, authorName: "..." },
  // ...
];

// Selectors pull subsets for different contexts:
// kudos-selectors.ts
export function getTopKudosByHearts(posts: KudosPost[], limit: number): KudosPost[] {
  return posts.sort((a, b) => b.hearts - a.hearts).slice(0, limit);
}

// Components consume via passed props, not direct import (server-page computes, hands down)
<HighlightCarousel posts={getTopKudosByHearts(KUDOS_FEED, 5)} />
```

**The client/server boundary (deliberate slot-props pattern):**

```typescript
// app/kudos/page.tsx (server component — stays there)
export default async function KudosPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  // Spotlight and sidebar are pure React nodes, precomputed here
  const spotlightNode = (
    <SpotlightBoard names={extractUniqueNames(KUDOS_FEED)} />
  );
  const sidebarNode = (
    <KudosSidebar stats={computeStats(KUDOS_FEED)} recentGifts={...} />
  );

  // Board gets these as slot props (ReactNode), not state
  return (
    <KudosBoard 
      spotlight={spotlightNode}  // ← passed as JSX, not re-rendered if filter changes
      sidebar={sidebarNode}
      allPosts={KUDOS_FEED}       // ← data to filter
    />
  );
}

// app/components/kudos/kudos-board.tsx ("use client" — owns filter state)
export function KudosBoard({ spotlight, sidebar, allPosts }: Props) {
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const filtered = selectedHashtag
    ? allPosts.filter(p => p.hashtags.includes(selectedHashtag))
    : allPosts;

  return (
    <>
      {spotlight}  {/* Static, never re-renders from filter changes */}
      <AllKudosFeed posts={filtered} /> {/* Only the feed updates */}
      {sidebar}    {/* Static */}
    </>
  );
}
```

This pattern keeps Spotlight and Sidebar out of the filter-state logic, keeps them server-renderable, and ensures they're computed once, not regenerated on every filter selection.

**The carousel hook (no library, custom per precedent):**

```typescript
// hooks/use-carousel.ts
export function useCarousel(itemCount: number) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((i) => (i + 1) % itemCount);
  };

  const prev = () => {
    setCurrentIndex((i) => (i - 1 + itemCount) % itemCount);
  };

  return {
    currentIndex,
    next,
    prev,
    canGoNext: currentIndex < itemCount - 1,
    canGoPrev: currentIndex > 0,
  };
}
// Mirrors use-scroll-spy.ts style: plain state + logic, no external lib
```

**Minor deviations (documented in code):**

```typescript
// lib/kudos/kudos-types.ts
type KudosStats = {
  received: number;
  sent: number;
  hearts: number;           // ← FR-18 says 4 rows; design shows 5 (adds this)
  secretBoxOpened: number;
  secretBoxUnopened: number;
};
// Comment: "Design screenshot (ground-truth) shows 5 stats rows, FR-18 spec text lists 4.
// Implementing per screenshot, which is more recent."

// lib/i18n/dictionaries/vi.ts
kudos: {
  gift: {
    openButton: 'Mở Secret Box',  // ← FR-19 says "Mở quà"; design says "Mở Secret Box"
  },
  // Comment: "Design-verbatim, prioritizing visual fidelity over spec prose."
}
```

## What We Tried

1. **Spec + test deep-read** — Fetched 64 specs + 41 test cases in parallel, catalogued every requirement.
2. **Precedent scanning** — Researcher surfaced existing patterns (F004 server/client boundary, F005 i18n structure, scroll-spy hook as template).
3. **Clarification auto-resolution** — For every gap (library choice, routing, state persistence, interaction scope), picked the option that honored existing conventions or deferred to follow-up tasks explicitly.
4. **Phase decomposition** — Split into 9 independent, parallelizable phases with clean dependencies (mock data → primitives → composed components → full page → tests).
5. **Data centralization** — All components consume from one `lib/kudos/kudos-data.ts` module, no data duplication across components.
6. **Carousel custom hook** — Mirrored `use-scroll-spy.ts` style (plain state + effect, no external lib), avoiding a new npm dependency.
7. **Slot-props server/client boundary** — Spotlight and sidebar passed as precomputed ReactNode props, keeping filter state isolated to the board component.

## Root Cause Analysis

**Why did the unattended run work so cleanly?**

The 20+ clarifications locked the scope upfront, which meant the implementation never had to stop and ask "wait, should we do X or Y?" Every ambiguity was already decided according to a clear rule: "Does the repo have this pattern? Use it. If not, mark it out of scope and defer it." This is the opposite of the usual path where scope drifts because decisions get made incrementally mid-phase.

**Why did the git-manager's initial commit go wrong?**

The `commit -m` template for this task likely fed the agent the diff stat + git status output, and the agent synthesized a plausible-sounding message ("infinite scroll animation", "active/completed filters") without cross-checking the actual source code. The diff files listed changes, but the agent's language generator didn't verify that the prose accurately described what those files actually do. This is a classic signal-loss problem: a tool gets data (file list, line counts) but not the semantic content.

## Lessons Learned

1. **Clarify scope with a rule, not a question.** When you say "Does this pattern exist in the repo?", you get consistent auto-resolutions. When you say "Should we do this?", you get endless negotiation. The 20 clarifications worked because each one had a clear *precedent-based* answer, not a design judgment. Build the rule first.

2. **Defer features explicitly, don't leave them ambiguous.** "Like-toggle is out of scope, render as static display" is clearer than "figure out the like-toggle interaction someday." The static display with a code comment (future wiring path) gives a reader a clear signal that this is deferred, not forgotten.

3. **Slot props (ReactNode children) cleanly separate server-rendered static from client-state-driven dynamic.** Spotlight and sidebar are precomputed on the server, passed as JSX nodes to the client component, and never re-rendered when state changes. This pattern is worth documenting as a precedent for future features.

4. **Static mock data as a single module, not scattered in components, forces consistency.** Every component derives from `lib/kudos/kudos-data.ts`, so the "database" is one place. Easier to add fields, easier to test, easier to replace with real data later.

5. **Custom hooks are the right granularity when a library is overkill.** `use-carousel.ts` is 55 lines, reuses the `use-scroll-spy.ts` pattern (state + effect, no dependency), and 5 slides don't need embla-carousel's machinery. YAGNI applies. But **document the policy**: "5 items: custom hook. 50+ items, complex animations: reconsider a lib."

6. **Automated commit messages must be validated by a human who has read the source.** The git-manager's first attempt included features that don't exist in the code. Someone with eyes on `kudos-card.tsx` and `spotlight-board.tsx` can catch that in 30 seconds ("wait, there's no infinite scroll here"). Build a gate: "Does the commit message accurately describe what the diff contains?"

7. **When spec prose conflicts with design screenshot, the screenshot wins.** (Stats row count, button label — both resolved per visual ground-truth, not text.) This is a test-code-design triage: visual design is usually more up-to-date than prose specs.

## Next Steps

1. **Commit message validation gate** — Add a checklist to the post-implementation review: one person reads the commit message, spot-checks it against the actual source files (does the message describe what's really there?), and approves or requests rewording before merge.

2. **Document the slot-props pattern** — Add a section to `docs/code-standards.md` with an example of the server/client boundary using ReactNode slot props. This pattern is cleaner than context or prop drilling for static-but-server-computed data.

3. **Like-toggle follow-up task** — Create a backlog item (F006.1 or F007?) for wiring the actual like/heart toggle interaction. Reference the code comment in `kudos-card.tsx` ("Future: wire toggle logic here") and the Clarifications doc so the next implementer knows exactly what was deferred and why.

4. **Profile routing stub** — F006 documents ("Future: route to /profile when route exists") should be cross-linked with a backlog item for creating `/profile/[id]` page. Until then, avatars render dead, which mirrors the account menu precedent.

5. **Test-data scalability check** — `lib/kudos/kudos-data.ts` currently has ~10 mock entries. Verify that Spotlight board search, All Kudos feed pagination/filtering, and stats aggregation work with 100+ entries. Add a load-test to prevent surprises if this ever connects to real data.

---

**Evidence sealed:** 330 unit tests (vitest, 60 files), tsc clean, next build clean, eslint clean.  
**Reviewer verdict:** 9/10 sealed, 0 critical defects.  
**Ready for merge.**
