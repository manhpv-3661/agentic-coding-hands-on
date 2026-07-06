# Kudos Compose Form — Conventions Research

## 1. `app/kudos/page.tsx` (F006 route)

Server Component: `requireUser()` → locale/dict → static mock data (`KUDOS_POSTS`, `KUDOS_STATS`, `RECENT_GIFT_RECIPIENTS`, `SPOTLIGHT_NAMES`) wired into `SiteHeader` → `KudosBanner` (static banner + composer pill) → `KudosBoard` (client, single filter-state owner) → `SiteFooter`.

**Compose hook point — confirmed no-op placeholder, exactly where new work plugs in:**
- `app/components/kudos/kudos-banner.tsx:46-54` — the "Ghi nhận" pill is a plain `<button>` with no `onClick`. Comment: *"Static — clicking is a no-op; the 'send a new Kudos' dialog is out of scope for this pass (clarifications.md)."*
- Confirmed in `plans/260706-2200-sun-kudos-live-board/clarifications.md:54-55`: *Q: "Ô nhập/Ghi nhận" composer bar (opens dialog)? → A: Render only, no dialog — compose/write flow is not one of the "6 tính năng" in scope.* This new feature is that deferred flow (likely F007).
- No modal/compose infra exists yet anywhere in `kudos-board.tsx`/`kudos-banner.tsx`.

## 2. Modal/Dialog primitive

**No headlessui/radix-ui dependency** (`grep` on `package.json` — empty). No generic `<Dialog>`/`<Modal>` component exists in the repo.

**One precedent — a hand-rolled inline dialog pattern**, `app/components/kudos/open-gift-button.tsx` (FR-19, "Mở quà"):
```tsx
const [open, setOpen] = useState(false);
...
{open && (
  <div role="dialog" aria-modal="true" aria-label={labels.dialogTitle}
       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-[#101317] p-6 text-white">
      ...
      <button onClick={() => setOpen(false)}>{labels.close}</button>
    </div>
  </div>
)}
```
This is the closest thing to a "dialog convention": local `useState`, conditional render, `role="dialog"`/`aria-modal`, fixed overlay + centered panel, dark theme (`bg-[#101317]`, `text-white`). **No focus-trap, no Escape-to-close, no portal.** For a form this size (many fields, image upload, rich text) this pattern needs extending, not reused verbatim — recommend at minimum adding Escape-close and focus management, reusing `useDismissableMenu` (see §3) for the Escape/outside-click semantics rather than reinventing it.

## 3. Reusable primitives found

- **`hooks/use-dismissable-menu.ts`** — shared open/close hook (toggle, outside-pointerdown-close, Escape-close, cleans up listeners only while open). Used by account menu, notification bell, widget button (`app/components/home/*`). Returns `{ open, setOpen, toggle, containerRef, triggerProps }`; `haspopup` option accepts `"menu" | "listbox" | "dialog"`. **This is the right primitive for the recipient searchable-dropdown/combobox** (haspopup="listbox") and could back the compose dialog's Escape/outside-click behavior too — DRY, don't rewrite this logic.
- **`app/components/kudos/kudos-filters.tsx`** — only existing "form-like" input pattern in kudos: two native `<select>` dropdowns, fully controlled via `value`/`onChange` props, parent (`kudos-board.tsx`) owns state. No searchable/combobox UI exists anywhere (`grep` for combobox/searchable/autocomplete found only test files referencing native `<select role="combobox">`).
- **No existing**: multi-tag input, char-counter input (only `maxLength` attr usage, e.g. `spotlight-board.tsx:47`), checkbox-reveals-field pattern, rich-text editor, `<form>`/`onSubmit` in the `app/` tree (only `app/todo/page.tsx` uses a `<form action={signOut}>` Server Action for sign-out — not a data-entry form).
- **Conclusion: every piece of this compose form (combobox, rich text, tag input, char counter, image upload, checkbox-reveal) is new** — nothing to reuse except `useDismissableMenu` and the dialog shell in `open-gift-button.tsx`.

## 4. Routing pattern

App Router structure is flat, one `page.tsx` per top-level feature: `app/{awards,kudos,login,prelaunch,todo}/page.tsx`. **No nested dynamic routes** (`app/kudos/[id]/page.tsx` etc. do not exist anywhere in the repo). Every "dialog-ish" UI found (`OpenGiftButton`) is a **client component mounted inline** within its parent tree, not a separate route/step-flow. F004 awards and F003 prelaunch were checked — no dialog/step-flow precedent in either (both purely presentational scroll/nav features).

**Recommendation:** build the compose form as an inline client-mounted dialog (matches `OpenGiftButton` precedent + flat routing convention), not a new `app/kudos/compose/page.tsx` route. A dedicated route would break from the only existing pattern and add unneeded routing complexity (YAGNI).

## 5. Test conventions

- **Runner:** Vitest (`vitest.config.ts`), `environment: "jsdom"`, `globals: true`, setup file `vitest.setup.ts` (just imports `@testing-library/jest-dom/vitest`). Test glob: `app/**/*.test.{ts,tsx}`, `lib/**/*.test.ts`, `tests/unit/**/*.test.{ts,tsx}`.
- **Library:** `@testing-library/react` (`render`, `screen`) + `@testing-library/user-event` (`userEvent.setup()`, always `await user.click(...)`).
- **Style** (from `open-gift-button.test.tsx`, `kudos-filters.test.tsx`): plain labels object literal passed as props (no i18n dictionary mocking needed at component level); assert via `getByRole`/`queryByRole` with `{ name }`; mock callbacks via `vi.fn()`; assert dialog absence with `queryByRole("dialog")).not.toBeInTheDocument()` before/after close. No component-level mocking beyond `vi.fn()` for callback props — no MSW/network mocking seen (all data is static mock imports).
- Selector/reducer tests (`lib/kudos/kudos-selectors.test.ts`) follow plain Vitest `describe/it`, a local `makePost(overrides)` builder, and explicit "does not mutate the input array" + "safe on empty input" cases — mirror this shape for any new pure "add kudos" selector/validation logic.

## 6. Commands

From `package.json` scripts:
```
"dev": "next dev"
"build": "next build"     # runs Next's type-check as part of build (no separate typecheck script exists)
"start": "next start"
"lint": "eslint"
"test": "vitest"
"e2e": "playwright test"
```
No dedicated `typecheck` script — `npm run build` is the closest thing to a type-check gate; `typescript@^5` is a devDependency so `npx tsc --noEmit` also works standalone if a faster pre-build check is wanted.

## 7. Current-user / identity concept

**None exists.** `requireUser()` (`lib/auth/require-user.ts`) only guarantees a Supabase-authenticated *session* (redirects to `/login` if absent) — it returns the Supabase `user` object (email-based), which is **never mapped** to a `KudosPerson` (`{ name, department, stars }`) in the mock data model. `app/components/home/account-menu-button.tsx:43` explicitly documents: *"no role system exists yet"* (clarifications.md, F002, session 2026-07-06). `KudosPost.sender`/`.recipient` in `lib/kudos/kudos-data.ts` are hardcoded Vietnamese names with no link to auth identity.

**Consequence for this feature:** there is no way to derive "who is the sender" or exclude "self" from the recipient dropdown from existing code — this is a genuine product gap, not something greppable. Needs an explicit decision (see Open Questions).

## 8. `docs/code-standards.md`

**Does not exist.** `docs/` only contains `features/`, `journals/`, `system/`, `README.md`. No explicit form/component convention doc — conventions must be inferred from sibling code (as done above). Feature spec for the base F006 board lives at `docs/features/f006-sun-kudos-live-board/feature.md`; a new F007-style spec would presumably follow that same location pattern.

## Open Questions
1. No current-user identity exists in the data model — who is "sender" for a submitted Kudos, and how/whether to exclude self from the recipient dropdown, needs a product decision (likely: pick an arbitrary mock "current user" constant, since no auth↔KudosPerson mapping exists).
2. Dialog vs page: recommending inline client dialog per §4, but confirm this matches product intent before committing (no explicit user preference captured yet).
3. `open-gift-button.tsx`'s dialog lacks focus-trap/Escape-close — decide whether the new compose dialog must add these (recommended, since it's a real data-entry form) or match the existing minimal precedent exactly.
