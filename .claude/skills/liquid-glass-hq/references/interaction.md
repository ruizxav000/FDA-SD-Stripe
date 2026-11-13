# Interaction, motion and mechanics

## How the glass works (and the rules it imposes)

Live `backdrop-filter` blur leaves rectangular repaint artefacts in Chrome when content under it re-renders, and it's expensive across dozens of cards. So on desktop the template fakes it:

- `bg.jpg` is the sharp scene, fixed behind the page (`.bg-scene`).
- `bg-blur.jpg` is a half-size, heavily blurred copy.
- Every `.glass` element paints `tint, scrim, bg-blur.jpg` with `background-attachment: fixed`, so each card shows exactly the slice of the blurred scene that sits behind it, which reads as frosted glass.

Rules that follow from this:

1. **Never `transform` a glass element** (or an ancestor of one). Fixed backgrounds stop pinning on transformed elements, and the card would show the wrong slice. Animate `top` (with `position:relative`), `height`, `margin` or `opacity` instead. The widget cycle and drill-down both do this.
2. **The scene and its blur copy must match** in framing (same aspect ratio, `center/cover`). Regenerate both together with `scripts/make_mesh.py` or `scripts/make_blur.py`.
3. **Touch devices** ignore fixed backgrounds, so under `(hover:none) and (pointer:coarse)` glass switches to a translucent tint with a real `backdrop-filter: blur(20px) saturate(160%)`. Mobile Safari draws that cleanly.
4. Full-page screenshots show horizontal seams where the viewport ended, because fixed backgrounds repeat per screenful. That is a screenshot artefact, not a bug; check visually with viewport-sized shots.

### Edge glow
`.glass::before` is a 1px ring (mask-composite exclude) filled with a radial highlight centred on `--mx/--my`. A single `pointermove` listener on `document` finds the hovered `.glass/.kpi/.app-tab`, sets those two properties as percentages and adds `.glow`. Mouse only; touch never shows it.

## Render loop

- State lives in one `state` object; `render()` rebuilds the tabs, hero sub-line, main view and rail from it with `innerHTML`. That keeps the code small and makes every view a pure function of state.
- Because of that, `captureFields()` / `restoreFields()` run around every render: drafts in `form[data-form]` survive, and the focused input keeps focus and caret. **Give every input a stable `id`** or this can't find it.
- Events are delegated: one `click`, `change`, `submit` and `keydown` listener on `document`, dispatching on `data-action`, `data-change` and `data-form`. Add a new action by adding a `case`.
- Inline fields (`data-change`) save on change; Enter blurs them, which commits. Selects blur after change so the next re-render doesn't fight the open menu.
- Writes go through `save(promise, okMsg)`: success → toast, failure → red toast with a plain-language reason. `canWriteNow()` guards every write so read-only viewers get a message instead of a silent failure.
- After an add, the form is reset and focus returns to its first field so people can add several in a row.

## Motion catalogue

| Thing | Duration / easing | Notes |
|---|---|---|
| Hover tints, chip/press states | .15s | colour/background only |
| Chrome frost on scroll | .3s opacity | `.scrolled` toggled in a rAF-throttled scroll handler |
| Greeting swap on tab change | .25s fade out, swap at 260ms, fade in | random line per tab, never the same twice running |
| Progress bars | .6s width | |
| Donut draw-in | each slice's share of 1s, staggered, `cubic-bezier(.22,1,.36,1)` | only on arriving at the dashboard |
| Bar draw-in | .9s `scaleX` from left, 55ms stagger | bars are SVG, not glass, so transform is fine |
| Drill-down open/close/resize | .38s height + opacity, `cubic-bezier(.4,0,.2,1)` | scrolls into view after |
| Rail widget cycle | every 8s: top fades .25s, rest slide up .5s via `top`, it fades back in at the bottom | desktop ≥861px only; paused on hover/focus or hidden tab |
| Photo cross-fade | 1.4s opacity between two stacked layers, every 9s | waits for `decode()` so fades never flash |
| "I'm" nudge | two .5s bounces | when someone completes a task without saying who they are |
| Toast | 3.2s, or 6s with Undo | |

`@media (prefers-reduced-motion: reduce)` kills every transition and animation, and the JS checks `REDUCED_MOTION` to skip the draw-in, drill animation and cycling.

## Patterns worth keeping

- **Undo over confirm.** Delete happens immediately; the toast offers Undo, which writes the saved copy back under the same id.
- **Who did it.** Completion stamps `doneBy` and `doneAt`, and the check fills with that owner's colour. "Recently completed" reads like a log.
- **Relative time everywhere.** "Due tomorrow", "2 days late", "in 9 days" in rows and badges; absolute dates in decks and tables.
- **Counts in filters.** Filter chips show how many rows each would show.
- **Read-only mode.** `state.canWrite = false` hides composers and edit/delete buttons, disables inline fields, and shows a `notice()`.

## Accessibility checklist

- Icon-only buttons have `aria-label`s naming the thing ("Delete task", "Copy email").
- Toggles use `aria-pressed`; current tab uses `aria-current="page"`; chip groups are `role="group"` with a label.
- `:focus-visible` draws a 2px accent outline; fields add a soft accent ring.
- Charts are `role="img"` with an `aria-label` listing every value, so the numbers aren't locked in the visuals.
- The toast is `role="status" aria-live="polite"`.
- Hit targets: 26px check, 30px icon buttons, 38px fields; keep new controls at least that size.

## Optional: a signature cursor

The original page used a custom SVG cursor (two overlapping shapes that nudge together over clickable things). To do the same, set `--cursor` and `--cursor-hand` in THEME to `url("data:image/svg+xml,…") x y, auto` and `…, pointer`. Keep it 28px or smaller with a dark outline so it stays visible on both the scene and white cards. Use it only when the page has a strong personal or brand identity; on a work tool the default cursor is the safer choice.
