# Clarifications — F006 (provisional) Sun* Kudos — Live Board

Session runs unattended (overnight, `--auto`). Per orchestrator instruction, gaps are
resolved by taking the recommended/most-consistent-with-precedent option rather than
blocking on `AskUserQuestion`. Recorded below, one line per decision.

## Session 2026-07-06

- Q: Spec prose language (`spec_lang`)? → A: `vi`. `docs/.rebuild-state.json` is absent in
  this repo (no `primary_lang` recorded), so the generic gate would default `--auto` to
  `en`. But F001–F005 (`docs/features/f00{1..5}-*/feature.md`) are all written in
  Vietnamese with `lang: vi` frontmatter — that is this project's real, established
  convention. Inheriting `vi` for consistency, not defaulting blind to `en`.
- Q: Spec doc shape — generic rebuild-spec 4-file set (`technical-spec.md` +
  `business-context.md` + `screens.md` + `edge-cases.md`) or this project's existing
  single-`feature.md` convention? → A: single `feature.md`, matching F001–F005 exactly
  (confirmed via `docs/features/f004-awards-information/feature.md`). Honoring the living
  codebase convention over the generic template per `development-rules.md` ("honor the
  codebase structure ... as you build").
- Q: SYSTEM (multi-feature decomposition) vs SINGLE? → A: SINGLE. One screen, one
  user-facing intent ("view/interact with the Kudos live board"); the "6 tính năng chính"
  are sub-sections of one page, not separate flows — same shape as F004 (6 award
  categories composed as one feature, not six).
- Q: Provisional feature code? → A: `F006` (next contiguous code after F005; real
  allocation/registration still happens at the promote step, not here).
- Q: Data source for kudos content (carousel/feed/stats/spotlight/leaderboard all need a
  consistent dataset)? → A: one static mock module `lib/kudos/kudos-data.ts` (mirrors
  `lib/awards/award-categories.ts`) — single source of truth consumed by every section's
  `buildXxx()` shaping function. No backend/DB in this mock project.
- Q: Hashtag / Phòng ban filter option lists (spec says "queried from the database")? → A:
  derive the distinct hashtag/department values from `lib/kudos/kudos-data.ts` at build
  time (the mock module *is* the stand-in "database" for this frontend-only mock
  project) — no live query layer exists or is in scope.
- Q: Filter selection persistence (URL query string vs local state)? → A: local React
  state only (`useState` in the client filter-holder component). No existing
  query-param-driven UI precedent in this repo (`AwardsNavMenu` uses hash-anchors, not
  query params) — YAGNI, add persistence later if a real need shows up.
- Q: Like/heart button — build the toggle interaction? → A: **No** (orchestrator
  instruction, out of scope — separate follow-up task). Render as a static, non-interactive
  `icon + count` pair (`<span>`, not `<button>` — no `aria-pressed`, no click handler) so it
  does not visually imply an interaction that isn't wired yet.
- Q: Avatar/name click → open profile page (per spec + several test cases)? → A: **No
  navigation** — no `/profile` or `/users/[id]` route exists anywhere in this repo (grep
  confirmed zero hits). Mirrors the exact precedent already set in
  `app/components/home/account-menu-button.tsx` ("Profile" menu item is a stub with no
  navigation, documented there). Avatar/name render as static info (no `<Link>`, no
  `onClick`). Hover-preview ("mở preview profile") is also out of scope — no profile data
  model exists to preview.
- Q: "Xem chi tiết" (View Details) on a Kudos card → open a Kudos detail page? → A: **No
  detail route in this pass** — building a `/kudos/[id]` detail page is a separate,
  larger surface not listed in the orchestrator's "6 tính năng chính" and not requested.
  Render the label statically (non-navigating) with a code comment noting the future
  route, matching the "Profile" stub precedent above.
- Q: "Ô nhập/Ghi nhận" composer bar (opens a "send a new Kudos" dialog + persists to DB)?
  → A: **Render only, no dialog** — the compose/write flow is not one of the "6 tính năng
  chính" the orchestrator asked for (Highlight, Spotlight, All Kudos, filters, stats,
  top-10-gift-recipients). Display the pill input + pencil icon per spec for visual
  fidelity; clicking is a no-op in this pass.
- Q: "Mở quà" (Open Secret Box) button → full reward/dialog mechanic? → A: Render the
  button; clicking opens a minimal static placeholder dialog (no reward logic, no
  persistence) — visible/testable per spec's "dialog opens" requirement without building
  an out-of-scope reward system.
- Q: Copy Link button — in scope? → A: **Yes**, implement for real (`navigator.clipboard
  .writeText` + a small local toast) — self-contained, no persistence, not the excluded
  "like" interaction, and directly required by multiple test cases.
- Q: Spotlight Board — build a real interactive canvas/word-cloud engine (pan, zoom,
  physics layout)? → A: **No** — no canvas/word-cloud library exists in this repo's deps
  and building one is out of scope for a mock training project. Build a static
  CSS-positioned name cloud (matching the design's visible name placement) + the "388
  KUDOS" counter + a decorative Pan/Zoom toggle button (visual state only) + a search
  input that does a real client-side substring filter, highlighting matching name(s) —
  this satisfies the loading/empty/interactive states in the test cases without a canvas
  engine.
- Q: Avatar images — real photos? → A: No photo assets exist for any mock person (Figma
  nodes are plain `ELLIPSE` placeholders, not exported images; confirmed via
  `list_media_nodes`). Render initials-in-a-colored-circle as the avatar (small shared
  `Avatar` component), consistent with there being no photo pipeline anywhere in this
  repo.
- Q: Gallery/attachment images on "All Kudos" cards (up to 5 per post)? → A: same
  reasoning as avatars — no exportable image asset (plain `RECTANGLE` placeholders).
  Render a generic placeholder tile (icon + muted background), not invented photos.
- Q: "10 SUNNER NHẬN QUÀ MỚI NHẤT" needs 10 entries but the design frame only shows ~5
  visible rows (scrollable list, spec confirms "Scroll: cho phép cuộn khi vượt chiều cao
  khung")? → A: the design's own visible rows are already an identical repeated
  placeholder ("Huỳnh Dương Xuân" / "Nhận được 1 áo phông SAA") — extend to 10 rows by
  repeating that exact same literal design content rather than inventing distinct new
  names, since the design itself provides no distinct data beyond the one placeholder
  string.
- Q: Highlight Kudos carousel — build with a library (embla/swiper) or custom? → A:
  custom (no carousel lib in `package.json`; mirrors `hooks/use-scroll-spy.ts`'s
  plain-state-and-effect style) — YAGNI, 5 static slides don't need a dependency.
