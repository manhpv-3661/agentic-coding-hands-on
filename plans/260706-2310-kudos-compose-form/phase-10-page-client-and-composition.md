---
feature: F007
phase: 10
title: Page-client wrapper + page composition
status: done
---

# Phase 10 — Page-client wrapper + page composition

## Context Links
- Spec: FR-2 (client-mounted, no new route), FR-21 (session-scoped prepend), NFR-4 (contract intact).
- Depends: Phase 08 (ComposeDialog), Phase 09 (banner trigger prop, card title).
- Existing: `app/kudos/page.tsx`, `app/components/kudos/{kudos-banner,kudos-board}.tsx`, `hooks/use-dismissable-menu.ts`.

## Overview
- **Priority:** P1 · **Status:** pending
- New client wrapper is the SINGLE owner of `posts` state + compose open/close. `page.tsx` stays a
  Server Component and renders the wrapper instead of Banner+Board directly.

## Key Insights
- `useDismissableMenu({ haspopup: "dialog" })` powers the dialog: `triggerProps` → banner pill,
  `containerRef` → dialog panel, `open` → render, `setOpen(false)` → onClose. One hook, no new logic.
- `posts` seeded from the `KUDOS_POSTS` prop; `addPost` prepends. Board consumes wrapper `posts`
  (not the module const) so a new post appears instantly in All Kudos + refreshes filter options
  for free (selectors run over the live array in the board).
- Spotlight + sidebar remain server-rendered `ReactNode` slots, passed THROUGH the wrapper to the board.

## Requirements
- **FR-2:** dialog mounts inline in `/kudos`; no `/kudos/new` route.
- **FR-21:** submit prepends to the wrapper's `posts`; state lost on refresh (accepted).
- **NFR-4:** `page.tsx` still `requireUser()` + locale/dict; no board/banner contract break beyond Phase 09's optional prop.

## Architecture
```ts
// kudos-page-client.tsx ("use client")
export interface KudosPageClientProps {
  initialPosts: KudosPost[];
  currentUser: KudosPerson;
  recipientOptions: KudosPerson[];
  hashtagOptions: string[];
  departmentOptions: string[];
  labels: Dictionary["kudos"];              // full slice; forwards banner/composer/board/compose sub-slices
  spotlight: ReactNode;
  sidebar: ReactNode;
}
// body:
const compose = useDismissableMenu({ haspopup: "dialog" });
const [posts, setPosts] = useState(initialPosts);
const addPost = useCallback((p: KudosPost) => setPosts((prev) => [p, ...prev]), []);
return (
  <>
    <KudosBanner labels={labels.banner} composer={labels.composer} composerTriggerProps={compose.triggerProps} />
    <KudosBoard posts={posts} hashtagOptions={hashtagOptions} departmentOptions={departmentOptions}
                labels={labels} spotlight={spotlight} sidebar={sidebar} />
    <ComposeDialog open={compose.open} containerRef={compose.containerRef}
                   onClose={() => compose.setOpen(false)} onSubmit={addPost}
                   recipientOptions={recipientOptions} mentionNames={recipientOptions.map((p) => p.name)}
                   currentUser={currentUser} labels={labels.compose} />
  </>
);
```
`page.tsx`: import `CURRENT_USER` + `getDistinctRecipients`; compute `recipientOptions`; replace the
`<KudosBanner/>` + `<KudosBoard/>` block inside `<main>` with `<KudosPageClient .../>` (pass the
existing spotlight/sidebar slot JSX unchanged).

## Related Code Files
- **Create:** `app/components/kudos/kudos-page-client.tsx`, `kudos-page-client.test.tsx`
- **Modify:** `app/kudos/page.tsx`

## Implementation Steps
1. Build `kudos-page-client.tsx` per the interface above; `"use client"`.
2. In `page.tsx`, add imports (`CURRENT_USER`, `getDistinctRecipients`); compute `recipientOptions`.
3. Replace Banner+Board with `<KudosPageClient>`, forwarding spotlight/sidebar slots + full dict slice.
4. Wrapper test: renders banner+board; clicking the pill opens the dialog (`getByRole("dialog")`);
   a stubbed submit prepends a post so it appears first in the feed; Escape/close hides the dialog.

## Todo List
- [x] wrapper owns `posts` + compose `useDismissableMenu`
- [x] banner pill wired to open dialog; board reads wrapper `posts`
- [x] `addPost` prepends
- [x] `page.tsx` computes `recipientOptions` + renders wrapper (still a Server Component)
- [x] wrapper test: open dialog, submit prepends, close hides

## Success Criteria
- Pill opens the dialog; a submitted Kudos appears at the top of All Kudos without refresh;
  `page.tsx` remains a Server Component and existing F006 board rendering is unchanged.

## Risk Assessment
- **Slot props no longer server-rendered (Med):** spotlight/sidebar are still built in `page.tsx`
  (server) and passed as `ReactNode` through the client wrapper — they never enter the client bundle
  as source (same slot pattern F006 already uses through `KudosBoard`). Keep that boundary.
- **`labels` prop shape mismatch (Low):** wrapper forwards `labels.banner/composer/compose` and the
  full slice to the board exactly as `page.tsx` did before.

## Security Considerations
- `requireUser()` gate unchanged. Session-only state, no persistence. None new.

## Next Steps
- Full-suite verification in Phase 11.
</content>
