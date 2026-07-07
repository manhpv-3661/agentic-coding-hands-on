# Spotlight Board Figma export (B.7_Spotlight)

Root node: `2940:14174` — "B.7_Spotlight" (FRAME), 1157×548px. The frame itself has no
fill — only a 1px `#998C5F` border and 47.14px border-radius — but it has TWO child
RECTANGLE nodes that carry the actual visual background:

- **`2940:14178` "image 24"** — 1098×617px overlay rectangle, plain (no fill data
  returned by the API — likely a solid/gradient layer or masked shape).
- **`2940:14181` "image 25"** — 1100×618px, `background: url(...) lightgray 50% / cover
  no-repeat`, `background-blend-mode: screen`. This IS the network/wave
  collage graphic visible behind the names (confirmed by rendering — see
  `images/spotlight-crop.png`). **Correction vs. an earlier pass of this export:** this
  asset is real, not absent — it was just missed because `list_media_nodes` /
  `list_media_items` only index nodes named `MM_MEDIA_*`, and this rectangle isn't named
  that way, so it never showed up in the asset list.
- We could **not** extract this image as an isolated file: MoMorph's `get_figma_image`
  tool (the one that renders/exports an arbitrary Figma node to PNG) returned HTTP 500
  for every node id tried in this session (unrelated to node validity — same error on
  simple nodes too), and `get_media_file` returned 401 Unauthorized. Both look like a
  server-side/auth issue on MoMorph's end, not something fixable from this session.
- **What we do have instead:** `images/spotlight-crop.png` — a pixel-accurate crop of
  the actual rendered frame (from `get_frame_image`, which works), cropped to the
  Spotlight board's exact bounds (absoluteX 142, absoluteY 1658, 1157×548 + 24px pad) at
  1x. It's a flattened composite (background + all names + UI baked in), not a clean
  isolated background asset, but it shows the true background pixels faithfully — good
  enough to eyeball-match colors/gradient or to re-derive the effect (looks like a
  colorful abstract wave/flame shape bottom-left + a constellation dot/line network
  overlay, blended with `screen` mode over the dark card).

The ~110 real, individually positioned TEXT nodes (person names + a notification-string
stack) sit on top of this background — implement their layout/styling from
`node-geometry.json`; implement the background either by asking someone with direct
Figma/MoMorph UI access to export node `2940:14181` manually, or by approximating the
look from `spotlight-crop.png`.

## Files in this folder

- **node-tree.json** — hierarchy (id/name/type/children) + inline specs for the 122-node
  subtree, from `get_frame_node_tree`. No position/size/color data. Its `characters`
  field for TEXT nodes is a copy of the Figma **layer name**, not always the true
  rendered text.
- **specs.json** — per-item spec rows (item/database/navigation/validation/description)
  for design-item nodes in this subtree.
- **image-node-ids.json** — candidate "image fill" node ids identified by naming
  convention only (nodes literally named `image N`); no imageRef/fill field exists in
  the source to confirm them.
- **node-geometry.json** — NEW. Full geometry/color/typography per node, merged from a
  `query_section` MCP call (real Figma styles) with `node-tree.json`'s text content.
  See schema below.

## node-geometry.json

- `rootNodeId`: `2940:14174`, `rootNodeName`: `B.7_Spotlight`
- `nodeCount`: 122 (all nodes present in the query_section subtree; matches node-tree.json 1:1)
- `nodes[]`: flat records with:
  - `id`, `name` (Figma layer name), `type`
  - `x`, `y` — position **relative to the root frame's top-left** (root itself is `x:0, y:0`)
  - `absoluteX`, `absoluteY` — original absolute Figma canvas coordinates, kept for reference
  - `width`, `height` — numeric px
  - `backgroundColor` — real background fill (only present on RECTANGLE/FRAME/INSTANCE
    containers, e.g. gradients/`var(...)` CSS strings for the 3 rect/instance nodes that have one)
  - `textColor` — text fill color (only present on TEXT nodes)
  - `fontSize`, `fontWeight`, `opacity` — numeric where available
  - `characters` — actual text content: query_section's real rendered `character` value
    when present, else falls back to node-tree.json's `characters` (layer-name copy)
  - `depth`, `parentId`, `visible` — passthrough from query_section
  - `raw` — the original per-node `styles` object verbatim, nothing dropped

All 122 nodes got real x/y/width/height. 117/122 have some background/text color info;
the other 5 are plain structural wrapper frames/instances (e.g. the "B.7.2_Pan zoom"
frame, the nested "Frame 483" icon+label row, the "MM_MEDIA_Search" icon instance) that
carry no fill of their own in the source.

### Known schema quirk (query_section)

`query_section` returned **two different style dialects** mixed in the same file:

- Most nodes: camelCase keys (`fontSize`, `fontWeight`, `backgroundColor`, ...). On TEXT
  nodes, confusingly, `backgroundColor` here actually holds the **text fill color**
  (e.g. `rgba(255, 255, 255, 1)`), not a box background.
- 6 TEXT nodes (the "X received a new Kudos" notification stack): kebab-case keys
  (`font-size`, `font-weight`, ...) plus an explicit `color` field (hex, e.g. `#FFF`) —
  this is the real text color for those nodes.

`node-geometry.json` normalizes both dialects into single `fontSize`/`fontWeight`/
`textColor` fields per node; the untouched original is kept in `raw` for either dialect.
