---
feature: F007
phase: 09
title: KudosCard title line + KudosBanner trigger
status: done
---

# Phase 09 — KudosCard title line + KudosBanner trigger

## Context Links
- Spec: FR-5 (title renders as a Kudos heading in the feed), FR-1 (pill opens dialog).
- Depends: Phase 01 (`KudosPost.title?`).
- Existing: `app/components/kudos/kudos-card.tsx` (+ `kudos-card.test.tsx`), `kudos-banner.tsx`, `hooks/use-dismissable-menu.ts`.

## Overview
- **Priority:** P1 · **Status:** pending
- Two small ADDITIVE leaf changes. Neither may break existing F006 tests.

## Key Insights
- `KudosCard`: render the title line ONLY when `post.title` is truthy → existing title-less posts
  (incl. `kudos-card.test.tsx`'s fixture) render exactly as before.
- `KudosBanner`: add an OPTIONAL `composerTriggerProps` prop; when omitted the pill stays inert →
  existing `kudos-banner.test.tsx` stays green. When provided, spread it onto the pill `<button>`.

## Requirements
- **FR-5:** when `post.title` present, render an accent heading line (between timestamp and content).
- **FR-1:** pill becomes the dialog trigger via `DismissableMenuTriggerProps` (onClick/aria-expanded/aria-haspopup).

## Architecture
```ts
// kudos-card.tsx — after the timestamp <p>, before the content <p>:
{post.title && (
  <p className="font-montserrat text-sm font-semibold text-[#FFEA9E]">{post.title}</p>
)}

// kudos-banner.tsx
import type { DismissableMenuTriggerProps } from "@/hooks/use-dismissable-menu";
export interface KudosBannerProps {
  labels: KudosBannerLabels;
  composer: KudosComposerLabels;
  composerTriggerProps?: DismissableMenuTriggerProps;   // F007: pill → compose dialog trigger
}
// spread onto the pill button:  <button type="button" {...composerTriggerProps} className=...>
```

## Related Code Files
- **Modify:** `app/components/kudos/kudos-card.tsx`, `app/components/kudos/kudos-card.test.tsx` (add a title-present case)
- **Modify:** `app/components/kudos/kudos-banner.tsx`, `app/components/kudos/kudos-banner.test.tsx` (add a trigger case)

## Implementation Steps
1. `kudos-card.tsx`: insert the conditional title `<p>` between timestamp and content.
2. Add a `kudos-card.test.tsx` case: a post WITH `title` renders it; a post WITHOUT renders no extra heading.
3. `kudos-banner.tsx`: add optional `composerTriggerProps`, spread onto the pill button.
4. Add a `kudos-banner.test.tsx` case: given `composerTriggerProps={{ onClick, ... }}`, clicking the pill
   calls `onClick`; without the prop, clicking is a no-op (button still present).

## Todo List
- [x] card renders `post.title` only when present
- [x] card test: title-present + title-absent
- [x] banner optional `composerTriggerProps` spread onto pill
- [x] banner test: trigger click fires `onClick`; omitted = inert
- [x] existing card/banner tests unchanged and green

## Success Criteria
- Title line shows for titled posts, hidden otherwise; pill fires the trigger when props supplied;
  all pre-existing card/banner assertions still pass.

## Risk Assessment
- **Regression in existing tests (Med):** both changes are strictly additive/optional; run
  `kudos-card.test.tsx` + `kudos-banner.test.tsx` immediately after editing.

## Security Considerations
- Title rendered as text. None.

## Next Steps
- Wired together by the Phase 10 wrapper (`composerTriggerProps` from `useDismissableMenu`).
</content>
