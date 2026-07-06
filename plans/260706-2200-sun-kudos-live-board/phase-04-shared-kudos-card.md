---
feature: F006
phase: 04
title: Shared Kudos card
status: done
---

# Phase 04 — Shared Kudos card

## Context Links
- Spec: FR-6 (highlight card fields), FR-13 (feed card fields).
- Clarifications: heart = static `<span>` (icon + count), NOT a `<button>` (no `aria-pressed`,
  no handler); "Xem chi tiết" static non-navigating (comment future `/kudos/[id]`); avatars/
  names static (no profile link); Copy Link real; hashtags clickable only in feed variant.
- Depends: **Phase 01** (`KudosPost` type), **Phase 03** (avatar, gallery, copy-link).
- Pattern refs: `app/components/home/award-card.tsx` (whole-card structure, inline SVG icons,
  `mm:` node comments, Montserrat scoping).

## Overview
- **Priority:** P1 · **Status:** pending
- ONE presentational card shared by Highlight (Phase 05) and All Kudos feed (Phase 07),
  parameterized by `variant`. Pure presentational (no `"use client"`) — it takes callbacks
  as props and renders client children (`copy-link-button`); it uses no hooks itself, so it
  is safe in either tree and rendered by the client sections.

## Key Insights
- Highlight vs feed differences are small enough for ONE card with props (DRY): clamp lines
  (3 vs 5), image gallery (feed only), "Xem chi tiết" CTA (highlight only), clickable
  hashtags (feed only, via optional `onHashtagClick`). A shared card avoids duplicated
  sender→recipient header markup.
- Header shape (both variants): sender avatar+name+department+stars → arrow/"sent" icon →
  recipient avatar+name+department+stars, then timestamp.
- Heart is `<span>` (icon + count), never a button (clarifications).
- If the single file exceeds 200 lines, split the sender→recipient header into
  `kudos-card-header.tsx` (presentational) — decide during build, note in code.

## Requirements
- **FR-6 (highlight variant):** avatars/names/departments/stars for sender+recipient, arrow,
  timestamp, content `line-clamp-3`, up to 5 hashtags/line (static), static heart count,
  "Copy Link" (real), "Xem chi tiết" (static, non-navigating).
- **FR-13 (feed variant):** same header, `line-clamp-5`, image gallery (up to 5 placeholder
  tiles), hashtags clickable (`onHashtagClick(tag)`), static heart count, "Copy Link" (real).
- **NFR-2:** <200 lines (split header out if needed).

## Architecture / boundary
- `app/components/kudos/kudos-card.tsx` — presentational.
  Props: `{ post: KudosPost; variant: "highlight" | "feed"; labels: { viewDetail; copyLink;
  copied }; onHashtagClick?: (tag: string) => void }`.
  - `variant === "highlight"` → clamp-3 + show `viewDetail` CTA (static `<span>`, code comment:
    future `/kudos/[id]`), NO gallery, hashtags static.
  - `variant === "feed"` → clamp-5 + `<KudosImageGallery count={post.imageCount} />`,
    hashtags rendered as `<button>` calling `onHashtagClick` when provided (else static).
  - Footer both variants: `<span>` heart icon + `post.hearts`, then `<CopyLinkButton link=
    {'/kudos#' + post.id} label={labels.copyLink} copied={labels.copied} />`.
- Copy Link builds an in-app anchor string (`/kudos#<id>`), since no detail route exists.

Data flow: section (05/07) maps filtered `KudosPost[]` → `<KudosCard post variant .../>`.

## Related Code Files
- **Create:** `app/components/kudos/kudos-card.tsx`
- **Create (if split):** `app/components/kudos/kudos-card-header.tsx`
- **Create:** `app/components/kudos/kudos-card.test.tsx`
- **Read for context:** `lib/kudos/kudos-types.ts`, `app/components/kudos/{avatar,copy-link-button,kudos-image-gallery}.tsx`, `app/components/home/award-card.tsx`

## Implementation Steps
1. Build the shared header: sender block (`<Avatar/>` + name + department + stars icon+count)
   → arrow/"sent" inline SVG → recipient block; timestamp line below.
2. Content `<p>` with `line-clamp-3` (highlight) or `line-clamp-5` (feed) via `variant`.
3. Feed only: `<KudosImageGallery count={post.imageCount} />`.
4. Hashtag row: map `post.hashtags` (cap 5/line); feed → `<button onClick={() =>
   onHashtagClick?.(tag)}>`, highlight → static `<span>`.
5. Footer: static heart `<span>` (icon + `post.hearts`) + `<CopyLinkButton/>`; highlight adds
   static "Xem chi tiết" `<span>` with a `// TODO future /kudos/[id]` comment.
6. If file >200 lines, extract header to `kudos-card-header.tsx`.

## Todo List
- [x] `kudos-card.tsx` both variants
- [x] heart rendered as `<span>` (assert NOT a button in test)
- [x] feed hashtags call `onHashtagClick`; highlight hashtags static
- [x] feed renders gallery; highlight does not
- [x] "Xem chi tiết" present (highlight) + static (no href)
- [x] `kudos-card.test.tsx`: renders sender/recipient names, content, hearts count, copyLink;
      variant differences; heart is a `<span>` not `<button>`
- [x] `npx tsc --noEmit` + vitest run

## Success Criteria
- One card renders both variants correctly; heart is non-interactive `<span>`.
- Feed hashtag click fires callback; highlight hashtags static; gallery feed-only.
- File(s) <200 lines, tests green.

## Risk Assessment
- **Card over-parameterization → bloat (Med/Med):** if conditionals get unwieldy, split header
  out (planned) rather than forking two cards. **Countermove:** keep variant branches shallow.
- **Accidental profile/detail navigation (Med/Low):** no `<Link>`/`href` on avatars, names, or
  "Xem chi tiết" — test asserts none present.

## Security Considerations
- Static content + in-app copy link. None beyond existing gate.

## Next Steps
- Phase 05 (highlight) and Phase 07 (feed) consume this card.
