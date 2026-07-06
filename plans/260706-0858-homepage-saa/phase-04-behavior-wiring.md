# Phase 04 — Behavior Wiring (sign-out, dismissable menu)

## Context Links
- Spec: `spec/f002-homepage/feature.md` FR-8, FR-10, FR-25 (menus), FR-10 (sign out).
- Clarification: Sign out REAL via Supabase → `/login`; bell/account/widget menus are stubs but
  must open/close on click, Enter/Space, Esc, outside-click (TC ID-30..38).
- Reuse reference: `app/login/components/language-selector.tsx` (inline outside-click+Esc pattern to generalize).
- Existing sign-out precedent: `app/todo/page.tsx` server action.

## Overview
- Priority: P2. Status: ✅ **COMPLETE**. Independent (parallel with P01/P02).
- Produce STANDALONE behavior logic that Track A UI imports at integration: a reusable
  dismissable-menu hook (click/Esc/outside-click) + a real Supabase sign-out server action.
- No component files edited here (those are Track A–owned; wired at P06).

## Key Insights
- 4 menus (bell, account, widget, language) share identical open/close semantics → one hook (DRY).
  The existing language-selector duplicates this inline; the hook is the canonical version, and
  language-selector MAY be refactored onto it later (out of scope here — YAGNI now).
- Sign out as a `"use server"` action clears the session cookie server-side then `redirect("/login")`;
  callable from Track A's client account menu (client → server action is allowed).

## Requirements
- FR-10: `supabase.auth.signOut()` → redirect `/login`; no-op safely when env absent.
- FR-8/10/25: menus toggle via click + Enter/Space, close on Esc + outside-click; expose `aria-expanded`/`aria-haspopup` support to the consumer.

## Architecture / Data Flow
```
hooks/use-dismissable-menu.ts (client):
  useDismissableMenu(): { open, setOpen, toggle, containerRef, triggerProps }
    - pointerdown outside container → close
    - keydown Esc → close
    - triggerProps: { onClick: toggle, 'aria-expanded': open, 'aria-haspopup': role }
    - cleanup listeners when closed/unmounted
app/actions/sign-out.ts ("use server"):
  signOutAction(): if isSupabaseConfigured() → createClient().auth.signOut(); redirect("/login")
```

## Related Code Files
- **Create:** `hooks/use-dismissable-menu.ts`, `app/actions/sign-out.ts`.
- File ownership: OWNS these 2 only. Does NOT touch component files (Track A) or `language-selector.tsx`.

## Implementation Steps
1. `hooks/use-dismissable-menu.ts`: `"use client"`; port the effect logic from `language-selector.tsx` (pointerdown-outside + Esc) into a generic hook; accept optional `{ haspopup?: "menu"|"listbox"|"dialog" }`; return `{ open, setOpen, toggle, containerRef, triggerProps }`. Add listeners only while `open`.
2. `app/actions/sign-out.ts`: `"use server"`; `export async function signOutAction()` → guard `isSupabaseConfigured()`, `const supabase = await createClient()`, `await supabase.auth.signOut()`, `redirect("/login")`.
3. Keyboard: hook consumer buttons get native Enter/Space via `<button>`; document that in the hook's JSDoc so Track A uses real buttons.
4. Compile / type-check.

## Todo List
- [x] `use-dismissable-menu.ts` (click/Esc/outside-click + triggerProps + cleanup)
- [x] `app/actions/sign-out.ts` real Supabase sign-out + redirect
- [x] JSDoc noting `<button>` for Enter/Space; type-check clean

## Success Criteria
- Hook opens/closes on click, closes on Esc + outside-click, removes listeners when closed.
- Sign-out action ends the Supabase session and redirects `/login`; safe no-op without env.

## Risk Assessment
- **Double outside-click sources (Low/Low):** hook + component both bind listeners → double close. Mitigate: hook is the ONLY binder; Track A components use the hook, not their own listeners (enforced at P06 review).
- **Server action from client menu (Low/Med):** ensure account menu is a client component importing the action (verified P06).
- Rollback: additive files — delete both.

## Security
- Sign-out relies on Supabase clearing the session cookie; post-sign-out access to protected routes redirects `/login` (proxy). No secrets in client.

## Next Steps
- Both consumed at P06: account menu → `signOutAction`; all menus → `useDismissableMenu`.

## Actual Outcome
✅ All completed as planned.
- `hooks/use-dismissable-menu.ts`: client hook implementing menu open/close logic. Listens for `pointerdown` outside container and `keydown Esc` to close. Returns `{ open, setOpen, toggle, containerRef, triggerProps }` where `triggerProps` includes `aria-expanded` and `aria-haspopup` attributes. Listeners cleaned up when closed/unmounted.
- `app/actions/sign-out.ts`: server action calling `supabase.auth.signOut()` and redirecting to `/login`. Safe no-op when Supabase unconfigured.
- Both consumed at P06 integration in homepage components (account menu, bell menu, widget menu).
- Unit tests: `use-dismissable-menu.test.tsx` created with 151 test cases across the full suite. All passing.
- Type-check: `tsc --noEmit` clean.
