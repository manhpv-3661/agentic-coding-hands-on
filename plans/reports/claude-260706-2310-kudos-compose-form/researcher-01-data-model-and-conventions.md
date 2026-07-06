# Research: Kudos compose-form data model & conventions

Skill activation: checked `tkm:help`; no research/search-docs skill applies — this is
pure internal-codebase investigation (Read/Grep), no external library docs needed.

## 1. Types — `lib/kudos/kudos-types.ts` (types-only module)

```ts
export interface KudosPerson {
  name: string;
  department: string;
  stars: number;           // recognition count, shown next to name
}

export interface KudosPost {
  id: string;
  sender: KudosPerson;
  recipient: KudosPerson;
  timestamp: string;       // pre-formatted "HH:mm - MM/DD/YYYY", literal string, no date lib
  content: string;
  hashtags: string[];
  imageCount: number;      // 0–5, placeholder tile count (no real image URLs anywhere)
  hearts: number;          // static like count, no toggle
}

export interface KudosStats { received; sent; hearts; secretBoxOpened; secretBoxUnopened: number }
export interface GiftRecipient { name: string; gift: string }
export interface KudosFilterState { hashtag: string | null; department: string | null }
```
No `KudosDraft`/`NewKudos` input type exists yet — a compose form will need to produce a
`KudosPost`-shaped object itself (mint `id`, format `timestamp`, set `hearts: 0`, `imageCount`
from selected attachments).

## 2. Mock "DB" — `lib/kudos/kudos-data.ts`

- `export const KUDOS_POSTS: KudosPost[] = [...]` — a plain in-memory array literal, 12 hardcoded
  entries. **No mutation helpers, no `addKudos`/`createKudos` function, no persistence.** It's a
  frozen module-level const (not even wrapped in a factory).
- Also exports: `SPOTLIGHT_NAMES: string[]`, `SPOTLIGHT_TOTAL = 388`, `KUDOS_STATS: KudosStats`,
  `RECENT_GIFT_RECIPIENTS: GiftRecipient[]`.
- Sample entry shape confirms field usage: `hashtags` are `"#teamwork"`-style with leading `#`,
  `timestamp` like `"09:30 - 12/25/2025"`, department strings are Vietnamese (`"Phòng Kỹ thuật"`).
- **Implication:** any "create a new Kudos" action has nowhere real to write to — this is a static
  module, imported directly by `app/kudos/page.tsx` (Server Component). A submit handler cannot
  mutate this array across requests/users. Options: (a) client-side-only optimistic prepend via
  React state lifted into `KudosBoard` (session-scoped, lost on refresh — consistent with this
  project's "frontend-only mock" pattern per clarifications.md), or (b) add an in-memory mutable
  store with a real `addKudosPost()` helper (still resets on server restart, still not
  multi-user-safe). No backend/API route exists in this repo for kudos (confirmed no `app/api/**kudos**`).

## 3. Selectors — `lib/kudos/kudos-selectors.ts` (pure, no I/O)

```ts
getDistinctHashtags(posts: KudosPost[]): string[]
getDistinctDepartments(posts: KudosPost[]): string[]
filterKudos(posts: KudosPost[], filter: KudosFilterState): KudosPost[]
getTopKudosByHearts(posts: KudosPost[], n = 5): KudosPost[]
```
None of these create/insert — all read-shaping only. `getDistinctHashtags`/`getDistinctDepartments`
would need to run against whatever array eventually includes the new post (so a submitted hashtag
becomes selectable in filters and a new department appears in the dropdown "for free").

## 4. Rendering — `all-kudos-feed.tsx` / `kudos-card.tsx`

- `AllKudosFeed({ posts, cardLabels, emptyLabel, onHashtagClick })` — receives **already-filtered**
  `KudosPost[]` from `KudosBoard` (owns `useState<KudosFilterState>`), maps to `<KudosCard variant="feed">`.
- `KudosCard({ post, variant: "highlight"|"feed", labels, onHashtagClick? })` — pure presentational,
  no hooks. Feed variant needs: `post.sender`/`recipient` (rendered via `Avatar` initials-circle,
  `PersonBlock`), `post.timestamp` (verbatim string), `post.content` (line-clamp-5), `post.imageCount`
  (via `KudosImageGallery`), `post.hashtags` (chips, max 5, feed = clickable `<button>`), `post.hearts`
  (static, non-interactive), `CopyLinkButton` (`link={"/kudos#" + post.id}`).
- **To appear correctly in "All Kudos," a new post must supply every `KudosPost` field** — there's no
  partial/optional rendering path; missing `sender.department`/`stars` etc. would just render "undefined".

## 5. `kudos-banner.tsx` — composer pill, currently a pure no-op

```tsx
<button type="button" className="...">
  <PencilIcon />
  <span>{composer.placeholder}</span>
</button>
```
No `onClick`, no `href`, no state. Confirmed by clarifications.md (F006 session, line 54-58):
*"Ô nhập/Ghi nhận composer bar... Render only, no dialog — the compose/write flow is not one of
the '6 tính năng chính'... clicking is a no-op in this pass."* This is the exact, explicitly-flagged
integration point for the new feature — attach `onClick` here to open a dialog or `router.push` to a
new route. Props today: `KudosBannerProps { labels: {title}, composer: {placeholder} }` — will need
an added callback/href prop.

## 6. Reusable leaf patterns

- `kudos-image-gallery.tsx`: `KudosImageGallery({ count, className? })` renders `count` (clamped 0–5)
  generic placeholder tiles — **no real image upload/preview exists anywhere**; this only renders
  a *count* of muted icon boxes, not actual attached files.
- `avatar.tsx`: pure functions `initials(name)`, `colorFor(name)` (deterministic hash → 6-color
  palette) + `Avatar({ name, size=40, className? })`. Fully reusable as-is for rendering the
  logged-in sender in a compose form preview.
- `copy-link-button.tsx` / `.test.tsx`: **only local toast pattern in repo.** `useState<boolean>` +
  `setTimeout` (2000ms) shows an absolutely-positioned `<span role="status">` bubble. Comment is
  explicit: *"Deliberately NOT a global toast system (YAGNI) — state lives entirely inside this
  component."* `grep -ri toast app lib` → **zero hits outside this one component** — there is no
  shared/global toast utility in this repo. A compose-form success notice should follow this same
  local, self-contained pattern rather than introducing a new toast system.

## 7. i18n — `lib/i18n/`

- Files: `lib/i18n/locale.ts` (`LOCALES = ["vi","en"]`, `DEFAULT_LOCALE = "vi"`, `isLocale()` guard),
  `lib/i18n/dictionary.ts` (`export type Dictionary = typeof vi` — `en.ts` checked via `satisfies
  Dictionary`), `lib/i18n/get-dictionary.ts` (`getDictionary(locale): Dictionary`, pure sync map),
  `lib/i18n/get-locale.ts` (`async getLocale(): Promise<Locale>` — reads `NEXT_LOCALE` cookie
  server-side via `next/headers cookies()`, defaults `"vi"`), `lib/i18n/dictionaries/{vi,en}.ts` +
  `parity.test.ts` (enforces key parity between the two).
- **Architecture**: no `useTranslation` hook — plain nested dictionary object, threaded as **props**
  from Server Component (`page.tsx`, calls `getLocale()`+`getDictionary()`) down through client
  components (`KudosBanner`, `KudosBoard`, `KudosCard` all take a `labels`/`composer` prop slice).
  Default/active locale in practice is **`"vi"`** (cookie-driven, defaults vi when absent).
- Current `kudos` namespace (`dictionaries/vi.ts:194-242`, mirrored in `en.ts`):
  `kudos.meta.description`, `kudos.banner.title`, `kudos.composer.placeholder`,
  `kudos.filters.{hashtagLabel,departmentLabel,allOption}`, `kudos.card.{viewDetail,copyLink,copied}`,
  `kudos.empty.{kudos,recipients}`, `kudos.spotlight.{searchPlaceholder,panZoom}`,
  `kudos.stats.*`, `kudos.gift.{openButton,dialogTitle,dialogBody,close}`, `kudos.recent.heading`.
  **No `kudos.form.*`/`kudos.dialog.*` namespace yet** — new keys must be added to both `vi.ts` and
  `en.ts` (parity test will fail otherwise) — likely a new `kudos.compose.*` sub-namespace (submit
  button, field labels/placeholders, validation errors, success toast text).

## 8. Rich text / tag-input / upload / mention components — none exist

- Grepped `app/` + `lib/` for `tiptap|slate|draft-js|quill|lexical|downshift|cmdk|combobox|
  multiselect|rich-text|tag-input|@mention`: only generic-English-word false positives (comments
  using the word "mention" in prose, e.g. clarifications.md text) — **no actual editor/tag-input/
  combobox component exists in this codebase.**
- No `<input type="file">` / upload component anywhere in `app/`.
- **Conclusion: any hashtag-chip input, recipient searchable-picker, or image-upload widget for the
  compose form must be built from scratch, minimal/custom** (KISS — mirror `kudos-filters.tsx`'s
  plain `<select>`/button patterns rather than reaching for a new dependency).

## 9. `package.json` — no relevant lib installed

Deps: `next@16.2.10`, `react@19.2.4`, `@supabase/ssr`, `@supabase/supabase-js`. Dev: vitest,
playwright, testing-library, tailwind v4, eslint. **No tiptap/slate/quill/lexical/downshift/cmdk**
— confirms build-from-scratch conclusion above. Adding one would be a new dependency decision, not
YAGNI-compliant unless the form's needs genuinely exceed a plain `<textarea>` + custom chip input.

## 10. Route / auth / F006 conventions

- Kudos board route: `app/kudos/page.tsx` (Server Component, `requireUser()` guard, `montserrat`
  fonts, `bg-[#00101A]`). **No `/kudos/new` route exists** — clarifications.md explicitly deferred
  compose ("not one of the '6 tính năng chính'... clicking is a no-op in this pass"), so the new
  feature is greenfield: either a dialog/modal opened from `KudosBanner`'s pill (keeps user on
  `/kudos`, simplest integration with `KudosBoard`'s existing `posts` state) or a new `/kudos/new`
  page (bigger surface, needs its own route + back-navigation).
- `requireUser()` (`lib/auth/require-user.ts`) returns the raw Supabase `User` object (or `null` if
  Supabase unconfigured) — **no mapping exists from Supabase user → `KudosPerson` (name/department/
  stars)**. There's no profile/employee-directory data model in this repo at all. This is a real
  gap: the compose form's "sender" (current user) has no `department`/`stars` source today.
- File-size convention: keep files < 200 lines (`development-rules.md`); existing kudos components
  average 40-160 lines and each ships a co-located `*.test.tsx` (e.g. `kudos-banner.test.tsx`,
  `all-kudos-feed.test.tsx`) — new compose components should follow the same 1-component-1-test-file
  pattern, kebab-case names.

## Open questions

1. **Persistence**: prepend-only client `useState` in `KudosBoard` (lost on refresh, matches this
   repo's "frontend-only mock" precedent) vs. adding a mutable module-level store in
   `kudos-data.ts` with a real `addKudosPost()`? Needs a product decision before planning.
2. **Sender identity**: no `KudosPerson` data exists for the logged-in Supabase user (no
   name/department/stars mapping). Does the form let the user manually type their own name/dept,
   or is a hardcoded/mock "current user" acceptable (mirrors existing mock-data philosophy)?
3. **Recipient picker**: is recipient selection free-text, or a searchable picker over
   `SPOTLIGHT_NAMES`/existing post senders/recipients (the only "people" datasets in this repo)?
4. **Entry point**: dialog-on-banner-click vs. dedicated `/kudos/new` route — not decided in any
   spec/clarifications doc; F006's clarifications only say the *current* pill is a no-op, not which
   direction the follow-up should take.
5. **Image attachment**: real file upload (needs storage — none configured beyond Supabase auth) vs.
   just bumping a mock `imageCount` like existing posts (consistent with "no real gallery images
   exist" precedent in `kudos-image-gallery.tsx`)?
