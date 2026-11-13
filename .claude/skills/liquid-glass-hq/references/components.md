# Component catalog

Every component lives in `assets/template.html`. Class names below are the real ones. Builders are JS functions that return HTML strings; pass all data through `esc()`.

## Contents
1. Page frame: scene, chrome, hero, page grid
2. Surfaces: glass and its tints
3. Section heading, notice, empty state
4. Controls: buttons, icon buttons, chips, pills, pill selects, fields, composer
5. Rows and cards: task row, spotlight card, record card, item card, quiet list
6. Panels: event panel, summary panel
7. Rail widgets
8. Dashboard: KPI tiles, chart cards, donut, horizontal bars, legend, drill-down table
9. Overlays: tooltip, toast

---

## 1. Page frame

```html
<div class="bg-scene"></div>                         <!-- fixed full-bleed scene: scrim over bg.jpg -->
<header class="chrome" id="chrome">                  <!-- fixed nav; gets .scrolled after 10px -->
  <div class="chrome-bg" aria-hidden="true"></div>   <!-- frosted layer, fades in on scroll -->
  <div class="chrome-inner"><span class="brand" id="brand"></span><nav class="app-tabs" id="tabs"></nav></div>
</header>
<section class="hero">
  <p class="greeting" id="greeting"></p>            <!-- "Lead text <strong>emphasised end.</strong>" -->
  <p class="hero-deck" id="hero-deck"></p>          <!-- one-line deck, or a quote's credit -->
  <div class="hero-sub" id="hero-sub"></div>        <!-- date · context · "I'm [A] [B]" chips -->
</section>
<div class="page" id="page">                        <!-- grid: main + 284px rail; .wide = single column -->
  <main id="main"></main>
  <aside class="side" id="side"></aside>            <!-- sticky rail of .widget.glass -->
</div>
```

- **Tabs** are `<button class="app-tab" data-action="tab" data-id="…">`; the current one has `aria-current="page"`. The URL hash mirrors the tab so links and reloads land on it.
- **Greeting** gets `.long` automatically when lead+ending exceed 52 characters (smaller size). It cross-fades on tab change.
- **"I'm" chips** record which owner is using the page (stored in localStorage). Completing a task requires it, so "Done by" is accurate; if missing, the chips nudge.

## 2. Glass surfaces

`.glass` is the only card surface. Tints:

| Class | Use |
|---|---|
| `.glass` | default card, row, panel |
| `.glass.accent` | spotlight items that need attention (Coming up) |
| `.glass.c1` | a money/metric widget that should stand apart |
| `.glass.quiet` | composers, empty states, notices, quiet lists |
| `.kpi` | dashboard tiles (same glass, hover brightens) |

All glass has `border-radius: var(--r-card)`, `box-shadow: var(--shadow)`, and the pointer-following edge glow. Never set a background colour on a glass element; change `--tint` instead.

## 3. Structure helpers

- `section(label, meta)` → `.sh` with `.sh-label` (accent, 15px/600) and `.sh-meta` (12px mute, may hold a `.link-btn`).
- `notice()` → `.notice.glass.quiet`: read-only or offline explanation at the top of a view.
- `empty(msg, extra)` → `.empty.glass.quiet`: says what will appear here and how. Shows "Loading…" until the store's first change.

## 4. Controls

| Element | Markup | Notes |
|---|---|---|
| Primary button | `<button class="btn">` | accent fill, pill radius (`--r-btn`) |
| Ghost button | `.btn.ghost` | white glass with hairline ring |
| Small button | `.btn.small` | in cards and section metas |
| Icon button | `.icon-btn` + an `ICON.*` svg | 30px square; always `aria-label` |
| Link button | `.link-btn` | inline "See all" style actions |
| Filter chip | `.chip[aria-pressed]` + `<span class="n">count</span>` | in a `.chips role=group` |
| Badge | `pill(ownerKey)` → `.pill` with `--c` | tinted fill + coloured text; `.pill.out` = unassigned |
| Pill dropdown | `selectBox('<select class="pill-select">', {pill:true, color})` | inline owner/status editing |
| Field dropdown | `selectBox('<select class="field">')` | in composers |
| Text/number/date field | `.field` (+ `.grow`, `.num`, `.date`) | 38px tall; focus ring is accent |
| Progress bar | `bar(percent, over)` | gradient fill; `.over` turns it `--alert` |

Every `<select>` sits inside `.select`, which draws one chevron tinted by `--c`. The chevron hides when the select is disabled.

**Composer** (`.composer.glass.quiet`): a wrapping flex row of fields with `.actions` pushed right. Used for both add forms (`data-form="add-…"`) and in-place edit forms (`data-form="edit-…"`, `.glass` not quiet, with Cancel). Give every input a stable `id`; the render loop uses ids to keep drafts and focus across re-renders.

## 5. Rows and cards

- **Task row** `taskRow(t)` → `.task.glass`: round `.check` (tinted by owner when done), title + `.task-meta` (due text coloured `.due-late` / `.due-soon`, part name on Overview), then `.task-tools`: owner pill select, edit, delete. Done rows get `.is-done` (strike-through, faint).
- **Spotlight card** `spotCard(t)` → `.spot.glass.accent` in a `.grid2`: title, `.spot-badge` (mono, "in 3 days" / "2 days late"), `.spot-deck` date line, footer with owner pill + "Mark done".
- **Record card** `personCard(p)` → `.card.glass`: `.card-head` (name, role deck, edit/delete), status pill select, `.contact` lines (mono, copy button), inline note field.
- **Item card** `itemCard(i)` → `.card.glass`: name, "left to pay" deck, `.figs` (planned + inline paid field), progress bar, optional note.
- **Quiet list** `.quiet-list.glass.quiet > .quiet-scroll > .q-row`: dense read-only rows (`.q-name`, `.q-meta`, `.q-note`); scrolls at 440px with hidden scrollbar. Use for history, activity, inbox.
- **Grids**: `.grid2` (two columns; a lone last card spans both) and `.stack` (8px vertical list).

## 6. Panels

- **Event panel** `.event.glass`: left = `.eyebrow` + giant `.count-n` + `.count-l`; right = `.facts` label/value rows (values may be links). Top of every milestone tab.
- **Summary panel** `.summary.glass`: title + inline total field, a bar, then `.stats` (4-up `.stat-lbl` / `.stat-val` / `.stat-sub`; 2-up under 860px).

## 7. Rail widgets

`.widget.glass` blocks, each starting `<p class="wlabel">LABEL</p><hr class="wdiv">` unless it is a hero number.

| Widget | Parts |
|---|---|
| Countdown | `.cd-row` × milestones: `.cd-n`, `.cd-l`, `.cd-date` |
| Reminder | `.reminder` single pull-quote |
| Money (`.c1` tint) | `.now-label`, `.now-val`, `.now-change` (mono, success colour), `.now-sub` |
| Week at a glance | `.wk-row` × 7 (+ overdue row): `.wk-day` mono, `.wk-desc` ellipsised, `.today` dot |
| Load | `.load-row`: owner pill + mono count |
| Photo (`.photo-card`) | two `.ph-layer` images cross-fading + `.photo-dots` |

Configure them in the `WIDGETS` array.

## 8. Dashboard

- **KPI row** `.kpis` (6-up → 3-up → 2-up): `.kpi` with `.kpi-lbl` (small caps), `.kpi-val` (optionally coloured by meaning: alert for overdue, accent for due-soon, c3 for paid), `.kpi-sub`.
- **Chart card** `card(label, meta, body)` → `.dcard.glass` with `.dcard-hd` (`.dcard-lbl` + `.dcard-meta` chip).
- **Donut** `donutSVG(segs, kind, {big, cap})`: segs `{key, name, v, label?, color}`. Each slice is its own arc path, draws in clockwise with staggered delays, thickens on hover, and opens a drill-down of type `kind`.
- **Horizontal bars** `hbarSVG(rows, max)`: rows `{key, name, v, max?, color, value, tip?, pct?, drill?}`. With `max`, the track is a faint tint of the bar colour (planned) and the bar is the bright part (paid).
- **Legend** `legend(segs)`: square swatches + mono values.
- **Drill-down** `drillView()` → `.drill.glass.dcard`: header (title in the slice colour, meta chip, close), then `.dt` table (`.num` columns right-aligned mono, `.sub` muted). Opens with a height slide; switching slices resizes in place.

## 9. Overlays

- **Tooltip** `#tooltip`: any element with `data-tip-name`, `data-tip-val`, `data-tip-pct`, `data-tip-color` gets one, following the pointer and flipping left near the edge. Dark navy on light themes.
- **Toast** `toast(msg, {bad, undo})`: top-centre pill with a status dot (success or alert). With `undo`, shows an Undo button and stays 6s instead of 3.2s.
