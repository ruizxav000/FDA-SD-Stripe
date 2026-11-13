---
name: glass-ui
description: >-
  Visual template for frosted "liquid glass" pages in a Stripe-inspired style. It covers a gradient-mesh backdrop, translucent glass boxes with a soft shadow and a mouse-following rim light, a nav bar that frosts in on scroll, a big light-weight headline, and three page templates (a dashboard with stat boxes, a line chart, a bar breakdown and a table; a list page; a form page), each its own page behind a nav tab. Use it whenever a page, artifact, dashboard or app screen should have this look, even when the user only says "glass boxes", "the transparent glass", "frosted cards", "our glass style" or "Stripe-style dashboard". It is the look only. It has no app logic, so build whatever the page actually does inside the boxes.
---

# Glass UI

`assets/template.html` is one working file with the whole look: theme tokens, the backdrop, glass boxes, the nav, and three pages (Dashboard, List, Form). Only the current page shows; the nav tabs switch between them via the URL hash. All content is placeholder, so replace it with the real page's content.

## Files

| Path | What it is |
|---|---|
| `assets/template.html` | The kit: CSS, the three page templates, and small JS for page switching, nav frost, rim light, chart drawing and tooltips. |
| `assets/bg.jpg`, `assets/bg-blur.jpg` | The backdrop and its blurred copy. Ship both next to the page; the CSS loads them by relative path. |
| `assets/preview.jpg` | The Dashboard page at 1360px. |
| `references/themes.md` | Token list, where the Stripe values came from, a dark variant, brand-use rules. |
| `scripts/make_mesh.py` | Paints a new gradient backdrop + blur copy from any colours. |
| `scripts/make_blur.py` | Makes the blur copy for a photo backdrop. |

## How the glass works

Each box paints three layers, all pinned to the viewport with `background-attachment: fixed`: a white tint, the scrim, and `bg-blur.jpg`. Because the blurred image is pinned, every box shows exactly the slice of the backdrop behind it, which reads as frosted glass. There's no live `backdrop-filter`, so no repaint glitches.

Rules that follow:
1. **Never `transform` a glass box or its parent.** Pinned backgrounds stop lining up on transformed elements. Animate `top`, `height` or `opacity` instead.
2. **`bg.jpg` and `bg-blur.jpg` must match.** Regenerate them together.
3. **Touch screens don't pin fixed backgrounds,** so the CSS switches glass to a real `backdrop-filter` blur under `(hover:none) and (pointer:coarse)`. Leave that block in.

Full-page screenshots show seams where each screenful ends; that's the screenshot tool repeating the fixed background, not a bug.

## Pages

Each page is a `<section class="view" id="view-NAME">` with its own `.hero` and `.page` grid. Add a page by adding a section, a nav tab (`<a class="tab" href="#NAME">`) and its name to `VIEWS`. Section ids are prefixed `view-` so the browser never jumps to them when the hash changes.

- **Dashboard** (`.page.wide`, full width): a 4-up row of stat boxes (`.lbl` label, `.big` number, `.delta.up` / `.delta.down` change), then a 2:1 row (`.grid-2-1`) with a line chart box and a bar breakdown box, then a section heading and a table box.
- **List** (main column + 284px side column): filter chips, a table box, and summary boxes in the side column.
- **Form** (main column + side column): fields grouped in glass boxes (`.form-row`, `.form-item` with label/field/hint), a box of on/off switches, the action buttons, and a help box on the side.

## Pieces

- **Glass box:** `class="glass box"`. Variants: `.glass.accent` (faint accent tint, for the box to see first) and `.glass.quiet` (lighter, no shadow). Padding: `.box`, `.box.tight` (stats, side column), `.box.flush` (tables). Change a box's tint with `--tint`, never with `background`.
- **Shell:** `.bg-scene` backdrop, `.chrome` nav (clear at the top, frosts in after 10px), `.hero` (`.headline` at weight 300 with a `<strong>` ending at 600, plus `.deck`), `.page` (add `.wide` to drop the side column; stacks under 860px).
- **Grids:** `.grid2`, `.grid4` (2-up on phones), `.grid-2-1`, `.sh` section heading.
- **In a box:** `.lbl`, `.box-head`, `.title`, `.text`, `.big`, `.delta`, `.pair` rows (add `.divide` to the box for hairlines), `.btn` / `.btn.ghost`, `.chip`, `.status` (status word in its colour via `--c`; no background or pill shape), `.field`, `.switch`, `.table` (`.num`, `.sub`).
- **Charts:** `lineChart(el, labels, values)` draws a single-series area/line chart at the box's real width (redrawn by a `ResizeObserver`, so text stays 10.5px on phones) with a crosshair tooltip on hover. `barChart(el, rows)` draws labelled horizontal bars with hover tooltips. Both use theme tokens only. For more series or other chart types, follow the `dataviz` skill.

## Using it

1. Copy `template.html`, `bg.jpg` and `bg-blur.jpg`. Keep the pages you need and replace the placeholder content.
2. For a claude.ai artifact, drop the outer `<!doctype>`, `<html>`, `<head>` and `<body>` tags (the viewer adds its own), and publish the two images through `files`.
3. In a React or other component codebase, lift the THEME tokens and the `.glass` / `.chrome` / `.page` rules into the global stylesheet, make `GlassBox` a wrapper that sets the class and `--tint`, and use the app's router instead of the hash switcher.
4. Change the look through the THEME tokens only. New backdrop colours: `python3 scripts/make_mesh.py <dir> --colors "#…,#…,#…,#…"`.
5. Check at 1360px and 390px wide. The text most likely to lose contrast is whatever sits on the brightest part of the backdrop; fix it with `--hero-ink`, a stronger `--scrim`, or a shorter band (`make_mesh.py --band`).

## Style rules

- One backdrop, many panes. Boxes differ by tint strength, not by new colours.
- One job per colour: `--accent` for actions, headings and chart marks; `--c3` for good change, `--alert` for bad; `--c1..c3` for status text.
- Light headlines with a heavy ending. Big numbers at 600 with tight tracking and tabular figures.
- One typeface: Inter, sans-serif only. No serif, slab or monospace faces, including for numbers, badges and charts.
- Keep motion short (150–300ms); it switches off under `prefers-reduced-motion` (already in the CSS).
- This is Stripe-*inspired*. Don't put Stripe's logo or name in the brand slot or make a page pass as Stripe's own.
- Status is coloured text only (`.status`). Don't wrap it in tinted pill or badge shapes.
