# Measurement Method — Real Pixel Conformance (Track A shared)

Reused from `plans/260707-0243-kudos-pixel-conformance/` (the method that fixed the earlier
eyeball-vs-measure miss). Every Track A phase (P3–P6) follows this — **no screenshot eyeballing**.

## The protocol

1. **Ground truth** — for each screen/section, pull MoMorph node data via
   `mcp__momorph__get_node` (and `list_frame_styles`). Record the authoritative box model per node:
   `width`, `height`, `padding*`, `margin*`, `gap`, `borderRadius`, `borderWidth`, `color`,
   `backgroundColor`, `fontSize`, `lineHeight`, `letterSpacing`, `fontWeight`.
2. **Rendered reality** — run the app locally (`npm run dev`), open the page, and in the browser
   read the *actual* computed values:
   - `getComputedStyle(el)` → colors, padding, margin, gap, border, radius, font metrics.
   - `el.getBoundingClientRect()` → real rendered width/height/position.
3. **Diff table** — per node: `property | momorph | rendered | Δ | fix`. A row is conformant when
   `Δ === 0` (or within sub-pixel rounding for computed lengths).
4. **Fix** — adjust the Tailwind arbitrary values / classes to close each non-zero Δ. The codebase
   inlines hex + arbitrary values (`bg-[#101317]`, `px-36`, `text-[57px]`) — match that style, do
   not introduce a token layer (YAGNI, see 0243 decision).
5. **Re-measure** — repeat step 2 until every tracked node's Δ is 0.

## Node mapping aid

Components already carry `mm:<nodeId>` comments and `MoMorph node <id>` doc headers (e.g.
`site-header.tsx` → `2167:9091`). Use those to line up rendered elements with `get_node` output.
Where a comment is missing, resolve the node via `list_frames` → `get_frame` → `get_node`.

## Font caveat (parallel-execution note)

Box-model properties (padding/margin/gap/border/radius/color/size) are font-independent — safe to
measure before P1 lands. Only **text-flow-driven heights** (a block whose height depends on how
text wraps) shift once Montserrat is globally active. Flag any such measurement `RE-VERIFY@P7`;
P7 re-measures them with the font active.

## Viewport

Design frame is 1512px wide. Measure at the desktop breakpoint the component targets (`lg:` =
1024px+, gutters `lg:px-36` = 144px per `site-header.tsx`). Note responsive intent; do not force the
1512px frame width onto a 100%-viewport element (code-rules "Sizing").
</content>
