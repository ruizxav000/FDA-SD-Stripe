---
name: liquid-glass-hq
description: >-
  UI/UX system and starter template for building "HQ"-style single-page apps (project hubs, launch trackers, ops dashboards, planners, team or client portals) with a Stripe-inspired look: a gradient-mesh scene, frosted-glass cards, a fixed nav with tabs, a big light-weight headline, a main column beside a sticky widget rail, task rows with owner badges, record cards, inline composers, KPI tiles, donut and bar charts with drill-down tables, tooltips and undo toasts. Use this skill whenever building or restyling a page, artifact, dashboard, tracker, admin view or internal tool that should look and behave like this, even if the user only says "make it look like our HQ page", "use our glass style", "Stripe-style dashboard", "tracker page", "hub", or "like the last one". Also use it to retheme the template for another brand.
---

# Liquid Glass HQ

A single-file HTML page system distilled from a production "HQ" page and rethemed to a Stripe-inspired light look. Start from `assets/template.html`: it already contains every component, the motion, the responsive rules and a working data layer, so a new page is mostly CONFIG edits plus whatever views the project needs.

## Files

| Path | What it is | When to read |
|---|---|---|
| `assets/template.html` | The complete starter page (CSS tokens, components, views, rail, dashboard, interactions, in-memory store, demo data). | Always: copy it as the starting point. |
| `assets/preview-overview.jpg`, `assets/preview-dashboard.jpg` | Screenshots of the template as shipped (1360px wide). | To compare a build against the intended look. |
| `assets/bg.jpg`, `assets/bg-blur.jpg` | The gradient-mesh scene and its pre-blurred copy. Both must ship next to the page. | Copy with the template. |
| `references/components.md` | Every component: markup, classes, variants, when to use it. | Before adding or changing a view. |
| `references/interaction.md` | How the glass works, motion rules, render loop, toasts/undo, drill-downs, rail cycling, accessibility, gotchas. | Before touching motion, rendering or the glass. |
| `references/themes.md` | Token roles, the Stripe theme and its sources, the original dark theme, how to build a new theme, brand-use rules. | When changing colours, fonts or brand. |
| `scripts/make_mesh.py` | Paints a new mesh scene + blur copy from any palette. | New palette or different band shape. |
| `scripts/make_blur.py` | Makes the blur copy for a photo scene. | Using a photo instead of a mesh. |

## Workflow

1. **Copy** `assets/template.html`, `assets/bg.jpg` and `assets/bg-blur.jpg` into the project (keep the three side by side; the CSS loads the images by relative path). For a claude.ai artifact, publish the images through `files`.
2. **Edit CONFIG** at the top of the script: `BRAND_HTML`, `OWNERS`, `ME_CHOICES`, `SECTIONS` (dated milestones; each becomes a tab with a countdown panel), `STATUSES`, `TABS`, `HERO_LINES` / `TAB_LINES`, `REMINDER`, `PHOTOS`, `DEMO`. Rename things to the project's words (the template says "Spend" and "Contacts"; a different project might say "Budget" and "Vendors").
3. **Map the data.** The `store` object is an in-memory stand-in with async writes and a change feed. Keep it for a static prototype. For shared, durable data in a claude.ai artifact, load the `artifact-capabilities` skill and back the same five methods (`add`, `update`, `set`, `remove`, `setSettings`, plus `onChange`) with the `db` capability. In a real app, back them with the app's API. Views never touch storage directly, so only `store` changes.
4. **Add or remove views** with the components in `references/components.md`. A view is a function returning an HTML string; register it in `render()`'s `views` map and in `TABS`. Escape every piece of data with `esc()`.
5. **Theme** only through the `:root` THEME block. Components never use raw colours, so a theme change is a token change (see `references/themes.md`). New palette → also run `scripts/make_mesh.py`.
6. **Verify** before handing over: open it at 1360px and 390px wide, click every tab, add/complete/delete a task (Undo should restore it), open and close a drill-down, check the console is clean. A Playwright pass with screenshots is the quickest way.

## Design principles (the "why" behind the template)

- **One scene, many panes.** The page is one continuous backdrop (mesh or photo) seen through frosted panes. Panes never get their own background colours; they get a *tint* (`.glass`, `.glass.accent`, `.glass.c1`, `.glass.quiet`). Variety comes from tint strength, not from new colours.
- **One job per accent.** `--accent` (blurple) means "act here / this is a heading / this is soon". `--alert` means late, over, failed. `--c1..c3` identify people or series. `--label` is for small-caps labels. Don't reuse an accent for a second meaning; readers learn the mapping within seconds.
- **Light headline, heavy ending.** Hero lines are weight 300 with the emphasised ending at 600 (`<strong>`). Big numbers (countdowns, KPIs, stats) are 600 with tight negative tracking and `tabular-nums`. Data, dates and money in small sizes use the mono face.
- **Quiet chrome, loud content.** The nav is transparent until the page scrolls, then frosts in. Section headings are small and coloured, not big. Meta text sits at `--mute`.
- **Everything editable in place.** Owner and status are pill dropdowns right on the row; notes and amounts are inline fields that save on change/Enter; edit swaps the row for a composer form; delete is instant with an Undo toast rather than a confirm dialog.
- **Glanceable rail.** The 284px right rail holds small read-only widgets (countdown, money, week, load). On desktop they take turns at the top every 8s; hovering or focusing the rail pauses it. Under 860px it drops below the content and stops cycling.
- **Charts are navigation.** Every donut slice and bar is clickable and opens a drill-down table of the rows behind it. Tooltips follow the pointer.
- **Empty and loading states are written, not blank.** Every list has an `empty()` message that tells the reader what will appear and how to make it appear.
- **Motion is short, eased, and optional.** 150–380ms for UI, longer only for chart draw-in and photo cross-fades. `prefers-reduced-motion` turns it all off. Glass is never moved with `transform` (it breaks the pinned background); animate `top`, `height` or `opacity` instead.

## Content and brand rules

- The template is *Stripe-inspired*, not Stripe-branded. Don't put Stripe's logo, wordmark or name in the brand slot, and don't present a page as Stripe's own: Stripe's Marks Usage Terms only allow noting that you use Stripe, and anything more needs their permission. Linking to Stripe docs, or saying "Payments powered by Stripe", is fine.
- Söhne (Stripe's typeface) is a licensed font. The template uses Inter with `ss01`/`cv11` as a free stand-in. Swap in Söhne only if the project has a licence.
- Copy is short, concrete and sentence-case. Buttons say what they do ("Add task", "Mark done"). Toasts confirm in past tense ("Task added", "Saved").

## Adapting the layout

- **No rail:** add the tab to `WIDE_TABS` (as the dashboard does).
- **Different widgets:** edit the `WIDGETS` array; each entry is `{id, cls, render}`. `cls` picks the tint (`""`, `"c1"`, `"accent"`, `"photo-card"`).
- **No milestones:** leave `SECTIONS` empty; the countdown widget and section tabs disappear with it. Remove the countdown KPI if you do.
- **More people:** add entries to `OWNERS` with `color` set to a theme token. Add a token (`--c4`) rather than a raw hex.
- **Dark variant:** see `references/themes.md`; the original redwoods-and-gold dark theme is kept there as a worked example.
