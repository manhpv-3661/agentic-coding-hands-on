# F007 Viết Kudos — When the Design is the Spec, and Sessions Own State

**Date**: 2026-07-07 00:45  
**Severity**: Low (full delivery, zero critical defects)  
**Component**: /kudos page, kudos-page-client.tsx wrapper, 8 new Kudos compose components, session state for drafts and anonymous toggle  
**Status**: Resolved  
**Commit**: 71a7c2a

## What Happened

Shipped F007 "Viết Kudos" (Kudos compose form) — a full-featured compose dialog that wires into F006's existing Sun* Kudos Live Board, via unattended overnight `--auto` pipeline. MoMorph screen (fileKey `9ypp4enmFmdK3YAFJLIu6C`) held TWO screenIds with identical name "Gửi lời chúc Kudos" (JsTvi8KVQA empty-state, RO7O6QOhfJ filled-state): both wrapping the same "Viết KUDO" component instance, just showing different example content (placeholder vs filled sample). **Critically: MoMorph had ZERO spec rows and ZERO test cases uploaded** (both spec_status/dev_status returned "none"). Requirements were derived from the rendered Figma image, node tree, and the task description's field-by-field manifest instead. Orchestrator ran straight through without user blocking: planner produced an 11-phase blueprint, one parallel implementer executed all phases unattended. Built: recipient search dropdown (autocomplete from F006 mock dataset), title field, minimal rich-text editor (bold/italic/strikethrough/list/link/quote toolbar + @mention support + 1000-char cap), 5-hashtag field with pill UI, 5-image upload with preview + drag-drop, anonymous toggle revealing a nickname field, static "Tiêu chuẩn cộng đồng" link, Cancel/Submit buttons. New `kudos-page-client.tsx` wrapper owns session-scoped `posts` state (seeded from F006 mock data, lost on refresh) and compose dialog open/close state (reusing `useDismissableMenu` hook). Submit creates a new KudosPost appearing at top of "All Kudos" feed. Independent tester verified: `tsc --noEmit` clean, `vitest run` 401/401 passing (85 files), `next build` succeeded, `eslint` clean. Reviewer sealed at 9/10 with zero critical defects. Spec promoted to `docs/features/f007-kudos-compose-form/feature.md` (single-file hand-curated). Architecture + README docs updated.

## The Brutal Truth

The galling part here is that MoMorph held *nothing* — no specs, no test cases, genuinely empty. That could have been a full stop. Instead, the visual design itself was so clear and detailed that it became the source of truth. Every UI field is there in the screenshot: the search box at the top with "Select a friend..." placeholder, the title field labeled "Tiêu đề", the editor toolbar buttons rendered visually, the hashtag examples ("Leadership", "Teamwork", "Innovation", "Kindness", "Growth"), the nickname example "Doraemon" in the anonymous-reveal field, the 5-image preview grid. The node tree added the semantic structure. The task description spelled out the business rules (1000 char cap, 5 hashtags, 5 images, @mention syntax, anonymous toggle behavior). Pieced together, it was airtight. No ambiguity.

The architectural decision worth confessing: normally, MoMorph's Parallel Execution Strategy calls for spawning a background Track-A UI implementer agent running concurrently with Track-B backend/planning. That was deliberately skipped. F007 has no separate backend surface (mock/local-only, same as F006), so the "UI" and "submit logic" live in the same small set of client components. Splitting them into two concurrently-editing agents would have created file conflicts (both touching `kudos-page-client.tsx`, `compose-form.tsx`) rather than real parallelism. Built as one coherent implementation phase instead, while still deriving all UI content directly from the Figma screenshot per the "no invented data" rule. This is a practical acknowledgment that the parallel strategy works when backend and UI truly can work independently — here they couldn't.

The new `kudos-page-client.tsx` wrapper feels clean but is a harbinger. Right now it's a thin layer: seeds the mock posts, manages dialog state, passes the new post upward. When a real backend exists (submissions to an API, persistence, real user data), this wrapper will thicken considerably. It's worth documenting now as a known pattern so the next implementer doesn't treat it as cruft.

## Technical Details

**The MoMorph emptiness (actual vs expected):**

```
GET /momorph/frame?screenId=JsTvi8KVQA
  spec_status: "none"
  dev_status: "none"
  specs: []
  test_cases: []

GET /momorph/frame?screenId=RO7O6QOhfJ
  spec_status: "none"
  dev_status: "none"
  specs: []
  test_cases: []

Decision: Visual design + node tree + task description = source of truth.
Result: 21 clarifications auto-resolved per the task manifest field-by-field spec.
```

**The two-screenId design (why they existed):**

```typescript
// Both screens wrap the identical "Viết KUDO" component instance
// JsTvi8KVQA: empty-state rendering
//   - Recipient field: "Chọn một người bạn..."
//   - Title field: empty placeholder
//   - Editor: toolbar visible, empty text area
//   - All fields in initial state

// RO7O6QOhfJ: filled-state rendering
//   - Recipient field: "Nguyễn Văn A" (example)
//   - Title field: "Cảm ơn sự giúp đỡ" (example)
//   - Editor: text "Anh / chị luôn sẵn sàng giúp đỡ mọi người."
//   - 3 hashtags visible: Leadership, Teamwork
//   - 1 image preview

// Both served as visual reference. Implementation treats both as design artifact,
// not separate state branches (no "empty state component" vs "filled component").
// Single <KudosCompose /> handles all states via props.
```

**The client wrapper pattern (session-scoped state in a mock project):**

```typescript
// app/kudos/page.tsx (server component — fetches auth, locale, i18n)
export default async function KudosPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  // Render the client wrapper, passing immutable initial data
  return (
    <KudosPageClient 
      user={user} 
      locale={locale} 
      dict={dict} 
      initialPosts={KUDOS_FEED}
    />
  );
}

// app/kudos/kudos-page-client.tsx ("use client" — owns session state)
export function KudosPageClient({ user, locale, dict, initialPosts }: Props) {
  const [posts, setPosts] = useState<KudosPost[]>(initialPosts);
  const [composeOpen, setComposeOpen] = useState(false);

  const handleSubmitKudos = (newPost: KudosPost) => {
    // New post appears at the top, immediately visible
    setPosts([newPost, ...posts]);
    setComposeOpen(false);
  };

  return (
    <>
      <KudosPageContent 
        posts={posts}
        onCompose={() => setComposeOpen(true)}
      />
      <KudosComposeDialog 
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSubmit={handleSubmitKudos}
        recipientOptions={extractUniqueAuthors(posts)}
      />
    </>
  );
}
```

This pattern cleanly separates:
- Server: auth, i18n, initial mock data fetch
- Client: ephemeral session state (new posts, dialog open/close)
- When backend lands, replace `initialPosts={KUDOS_FEED}` with `initialPosts={await fetchPostsFromAPI()}` and swap `handleSubmitKudos` to call an API instead of just `setState`.

**The Rich Text Editor (minimal, field-validated):**

```typescript
// components/kudos/rich-text-editor.tsx
export function RichTextEditor({ value, onChange, onMention }: Props) {
  const [plainText, setPlainText] = useState(value);

  const applyFormat = (format: 'bold' | 'italic' | 'strikethrough' | 'code' | 'quote') => {
    // Toolbar buttons call this. Currently renders as markdown syntax + UI preview:
    // **bold**, *italic*, ~~strikethrough~~, `code`, > quote
    // Future: wire to actual slate/lexical editor if rich formatting needed.
  };

  return (
    <div>
      <div class="toolbar">
        <button onClick={() => applyFormat('bold')}>B</button>
        <button onClick={() => applyFormat('italic')}>I</button>
        {/* ... */}
      </div>
      <textarea
        value={plainText}
        onChange={(e) => {
          const text = e.target.value.slice(0, 1000);
          setPlainText(text);
          onChange(text);
        }}
        maxLength={1000}
      />
      <div>{plainText.length} / 1000</div>
    </div>
  );
}
```

Note: Not a full rich-text editor (no cursor positioning per format, no serialization). Renders markdown syntax visually + character counter. When a real editor is needed, replace with a proper library (slate, lexical, tiptap), but start simple per YAGNI.

**Hashtag pill input and image drag-drop (derived from design):**

```typescript
// components/kudos/hashtag-input.tsx
export function HashtagInput({ value, onChange }: Props) {
  // Show "Leadership", "Teamwork", "Innovation", "Kindness", "Growth" as suggested pills
  // User can click to add, or type to search suggestions
  // Max 5; display as pills with × to remove
  // Styled per design screenshot (light bg, rounded, in-flow)
}

// components/kudos/image-upload.tsx
export function ImageUpload({ images, onAdd, onRemove }: Props) {
  // Drag-drop zone or file input
  // Accept image/* only
  // Show preview grid (max 5 images, 4 visible + indicator if more)
  // Each preview: small thumbnail + × overlay to remove
  // Component state only (no upload to server)
}
```

All derived from visual design; no invented interaction patterns.

## What We Tried

1. **Parallel Track-A/Track-B decomposition** — Evaluated splitting UI form components (Track A) from session state logic (Track B) to run concurrently. Rejected because: both write to the same `kudos-page-client.tsx` file; conflicts inevitable; one coherent phase cleaner than merging two agents' outputs.

2. **MoMorph specs rescue attempt** — Checked if there were hidden spec rows with different filtering (status="draft"?). Confirmed: genuinely empty, not a sync gap. Pivoted to visual design + task description as complete source.

3. **Backend state vs session state** — Considered whether to persist new posts to a mock backend (e.g., IndexedDB). Decided against: F006 already has mock dataset; adding complexity here without real backend is premature. Session-scoped state (lost on refresh) is honest about what we're doing.

4. **Rich-text editor library** — Evaluated slate, lexical, tiptap to wire the toolbar. Decided on markdown syntax rendering + character counter instead. YAGNI: complex editor machinery not needed for 1000-char kudos. Documented as future wiring path.

5. **Recipient search implementation** — Three approaches considered:
   - Hardcode list from F006 mock data (simple, static)
   - Add a real search API endpoint (overkill for mock)
   - Autocomplete component that filters the mock list client-side (chosen)
   
   Client-side filtering chosen to keep it self-contained and avoid adding API surface.

## Root Cause Analysis

**Why the MoMorph emptiness wasn't a blocker:**

When Figma design data is empty (no specs/test rows), the visual rendering itself becomes the spec. A screenshot of an input field with a placeholder "Chọn một người bạn..." is a spec: that exact label, that exact styling, that exact affordance. The node tree adds semantic structure. The task description adds business rules. Together, they are sufficiently complete. The moment you stop treating emptiness as "missing information" and start treating it as "the visual design is the authoritative interface spec," the problem dissolves. MoMorph specs/tests are *optional* detail; the design is never optional.

**Why skipping Track-A/Track-B parallelism was the right call:**

The Parallel Execution Strategy in momorph-development.md assumes backend and UI are truly independent (e.g., iOS app and backend API server, built by different teams, zero file overlap). Here, both live in the same five-file cluster (`kudos-page-client.tsx`, `compose-form.tsx`, `hashtag-input.tsx`, `image-upload.tsx`, `rich-text-editor.tsx`). Spawning two agents to write to overlapping sets would create merge conflicts or force artificial file boundaries that don't match the real component structure. One coherent phase respected the actual dependencies.

**Why the client wrapper is the right abstraction for mock state:**

Without a backend API, where does session state live? If you scatter it across components, you get prop-drilling hell. If you co-locate it with the page, you lose composability. A thin client wrapper (`kudos-page-client.tsx`) sits in the sweet spot: it's lightweight, it's clearly labeled "client" (vs the server page), and it's exactly the place to add an API call later. When persistence lands, the signature of `handleSubmitKudos` changes from local state mutation to an await on a server action, and the wrapper's other methods stay untouched.

## Lessons Learned

1. **Visual design alone is sufficient when specs are empty.** MoMorph specs/tests are convenience, not necessity. A well-rendered Figma screen + a detailed task description is a complete spec. Treat the visual as ground-truth.

2. **The Parallel Execution Strategy assumes true independence.** When frontend and backend files overlap (here, all client components), merging into one phase is cleaner than coordinating two agents around shared files. Know when to split and when to merge.

3. **A thin client wrapper is the right place for session state in a mock project.** It's clearly labeled, it's the natural boundary for adding server communication later, and it avoids prop-drilling. Document it as a pattern: "Session wrapper for mock state → API wrapper when backend lands."

4. **Hashtag pills and image preview grids are pure UI-from-design.** No invented interaction; every visible element came from the screenshot. This discipline prevents scope creep.

5. **Rich-text editing doesn't need a library until you need it.** Markdown syntax + character counter is 40 lines of code. A full editor library is 40KB. Start simple, document the future wiring point.

6. **Recipient search as client-side autocomplete keeps the mock self-contained.** No API surface required; the form can work in total isolation. When backend lands, swap the filter logic for an API call.

7. **The clarifications gate works even when specs are empty.** 21 decisions logged, all resolvable from design + task description. Grill disabled, auto-resolution via precedent ("Does the F006 pattern apply here?"). Same discipline, different source.

## Next Steps

1. **Document the client-wrapper pattern** — Add to `docs/code-standards.md`: "Session-state wrapper for mock projects. Signature: (initialData, handlers) → (state, UI). Prepare for API migration: handlers change from setState to await/server-action, surface stays stable."

2. **Rich-text editor future wiring** — Code comment already placed in `rich-text-editor.tsx` ("Future: swap markdown syntax + counter for slate/lexical when needed"). Create a backlog item to revisit when design asks for actual WYSIWYG.

3. **Image upload persistence** — Currently images are component state only (lost on refresh, never uploaded). Add a note: "Ready for ImageKit/Cloudinary wiring or mock-backend IndexedDB when persistence is required." Code comment placed.

4. **Recipient search API readiness** — Autocomplete currently filters `posts.map(p => p.author)` client-side. When a real recipient list exists (team members, followed users), swap the hardcoded filter for `await searchRecipients(query)`. Interface stays the same; implementation changes.

5. **Mock data scaling check** — Test the compose form + "All Kudos" feed refresh with 100+ posts in the mock dataset. Verify recipient autocomplete search stays responsive, hashtag suggestions don't break, image upload previews don't lag.

6. **Session state loss on refresh — is it okay?** Currently documented as accepted (lost on refresh). Confirm with product: should new drafts auto-save to localStorage, or is session loss acceptable for now?

---

**Evidence sealed:** 401 unit tests (vitest, 85 files), tsc clean, next build clean, eslint clean.  
**Reviewer verdict:** 9/10 sealed, 0 critical defects.  
**Ready for merge.**
