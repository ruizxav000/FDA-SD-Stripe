---
name: glass-ui
description: >-
  Visual template for frosted "liquid glass" pages in a Stripe-inspired style. It covers a gradient-mesh backdrop, translucent glass boxes with a soft shadow and a mouse-following rim light, a nav bar that frosts in on scroll, a big light-weight headline, and a main column beside a sticky side column. Use it whenever a page, artifact, dashboard or app screen should have this look, even when the user only says "glass boxes", "the transparent glass", "frosted cards", "our glass style" or "Stripe-style". It is the look only. It has no app logic, so build whatever the page actually does inside the boxes.
---

# Glass UI

`assets/template.html` is a working page with the whole look in plain CSS: theme tokens, the backdrop, glass boxes, the page shell and the few styles for what sits inside a box. It also has about 30 lines of JS for the nav frost, the current tab, and the rim light. Copy what you need and put your own content in the boxes.

## Files

| Path | What it is |
|---|---|
| `assets/template.html` | The kit page. Copy its `<style>` and the shell markup. |
| `assets/bg.jpg`, `assets/bg-blur.jpg` | The backdrop and its blurred copy. Ship both next to the page; the CSS loads them by relative path. |
| `assets/preview.jpg` | What the kit looks like at 1360px. |
| `references/themes.md` | Token list, where the Stripe values came from, a dark variant, brand-use rules. |
| `scripts/make_mesh.py` | Paints a new gradient backdrop + blur copy from any colours. |
| `scripts/make_blur.py` | Makes the blur copy for a photo backdrop. |

## How the glass works

Each box paints three layers, all pinned to the viewport with `background-attachment: fixed`: a white tint, the scrim, and `bg-blur.jpg`. Because the blurred image is pinned, every box shows exactly the slice of the backdrop that sits behind it, which reads as frosted glass. No live `backdrop-filter`, so no repaint glitches and no cost per box.

Three rules follow:
1. **Never `transform` a glass box or its parent.** Pinned backgrounds stop lining up on transformed elements. Animate `top`, `height` or `opacity` instead.
2. **`bg.jpg` and `bg-blur.jpg` must match.** Regenerate them together (`make_mesh.py` or `make_blur.py`).
3. **Touch screens don't pin fixed backgrounds,** so the CSS switches glass to a real `backdrop-filter` blur under `(hover:none) and (pointer:coarse)`. Leave that block in.

Full-page screenshots show seams where each screenful ends; that's the screenshot tool repeating the fixed background, not a bug.

## Pieces

- **Glass box:** `class="glass box"`. Variants: `.glass.accent` (faint accent tint, for the box that should be seen first), `.glass.quiet` (lighter, no shadow, for forms and secondary panels). Padding: `.box`, `.box.tight` (side column, stat boxes), `.box.flush` (tables). Set a box's tint with `--tint`, never with `background`.
- **Rim light:** `.glass::before` is a 1px ring lit where the mouse is. The JS sets `--mx/--my` and `.glow`. Mouse only.
- **Shell:** `.bg-scene` (fixed backdrop), `.chrome` (fixed nav, clear at the top, frosts in after 10px of scroll), `.hero` (`.headline` at weight 300 with a `<strong>` ending at 600, plus a `.deck` line), `.page` (main column + 284px sticky `.side`; add `.wide` to drop the side column; stacks under 860px).
- **Layout inside `main`:** `.grid2`, `.grid4` (2-up on phones), `.sh` section heading (`.sh-label` in the accent, `.sh-meta` muted).
- **Inside a box:** `.lbl` small-caps label, `.title`, `.text`, `.big` number (tabular), `.pair` label/value rows (add `.divide` to the box for hairlines between them), `.btn` / `.btn.ghost` (pill buttons), `.pill` badge (tint it with `--c`), `.field`, `.table`.

## Using it

1. Copy `template.html`, `bg.jpg` and `bg-blur.jpg`. Delete the demo boxes, keep the shell and the CSS.
2. For a claude.ai artifact, drop the outer `<!doctype>`, `<html>`, `<head>` and `<body>` tags (the viewer adds its own), and publish the two images through `files`.
3. In a React or other component codebase, lift the THEME tokens and the `.glass` / `.chrome` / `.page` rules into the global stylesheet, and make `GlassBox` a wrapper that sets the class and `--tint`.
4. Change the look through the THEME tokens only. New colours for the backdrop: `python3 scripts/make_mesh.py <dir> --colors "#…,#…,#…,#…"`.
5. Check at 1360px and 390px wide. The text most likely to lose contrast is whatever sits on the brightest part of the backdrop. Fix it with `--hero-ink`, a stronger `--scrim`, or a shorter band (`make_mesh.py --band`).

## Style rules

- One backdrop, many panes. Boxes differ by tint strength, not by new colours.
- One job per colour: `--accent` for actions and section headings, `--alert` for problems, `--c1..c3` for series or identities.
- Light headlines with a heavy ending. Big numbers at 600 with tight tracking and tabular figures. One typeface throughout: Inter, sans-serif only. No serif, slab or monospace faces, including for numbers and badges.
- Keep motion short (150–300ms) and turn it off under `prefers-reduced-motion` (already in the CSS).
- This is Stripe-*inspired*. Don't put Stripe's logo or name in the brand slot or make a page pass as Stripe's own. Inter stands in for Stripe's licensed Söhne font, and it is the only font the kit uses.
