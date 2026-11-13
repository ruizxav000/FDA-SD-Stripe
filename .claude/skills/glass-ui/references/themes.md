# Themes

Every colour, radius, shadow and font in `assets/template.html` is a token in the `:root` THEME block. A new theme is a new THEME block plus a matching backdrop (`bg.jpg` + `bg-blur.jpg`).

## Tokens

| Token | Role |
|---|---|
| `--page` | canvas behind everything |
| `--scrim` | wash over the backdrop to calm it under text |
| `--strong`, `--ink`, `--mute`, `--mute-faint` | headings and big numbers, body text, secondary text, placeholders |
| `--hero-ink` | text sitting directly on the backdrop (brand, tabs, headline) |
| `--accent`, `--on-accent` | the one action colour and the text on it |
| `--label` | small-caps labels |
| `--c1`, `--c2`, `--c3`, `--alert` | series/identity colours; `--c3` doubles as success; `--alert` for problems |
| `--glass`, `--glass-accent`, `--glass-quiet` | box tints: default, highlighted, recessive |
| `--glass-low`, `--glass-hi` | faint hover fill; ghost buttons and the current tab |
| `--field` | input background |
| `--chrome` | nav tint once scrolled |
| `--hair`, `--hair-faint` | borders and dividers |
| `--edge-glow` | the rim light |
| `--shadow`, `--shadow-lg` | box elevation; overlays |
| `--blur` | live blur strength on touch screens |
| `--r-box`, `--r-ctl`, `--r-btn` | radii |
| `--f-body` | the one font (Inter); numbers use `font-variant-numeric: tabular-nums`, never a monospace face |

## The Stripe-inspired default

These values come from third-party breakdowns of stripe.com and Stripe's commonly cited colours. They're close but not official, so check them against the live site if exact matches matter.

- **Colour:** blurple `#635BFF` for actions, navy `#0A2540` for headings, `#425466` slate, `#F6F9FC` page, `#E3E8EE` borders, `#30313D` body text, `#0570DE` info blue, `#DF1B41` danger. Some analyses give the current primary as `#533AFD`.
- **Backdrop:** a band of magenta `#EF008F`, sky `#6EC3F4`, violet `#7038FF` and amber `#FFBA27` across the top with a slanted bottom edge. `scripts/make_mesh.py` recreates it (band 0.46, -12° skew, seed 5).
- **Type:** Stripe uses Söhne (licensed), light and large for headlines. The kit uses Inter with `ss01`/`cv11` as the free stand-in, and nothing else: no serif, slab or monospace faces.
- **Depth and shape:** soft layered blue-grey shadows instead of borders, pill buttons, 8px controls, 12px boxes, tinted badges.

**Brand use:** don't use Stripe's logo, wordmark or name as a page's brand, or make a page that passes as Stripe's own. Stripe's Marks Usage Terms allow noting that you use Stripe; anything more needs their permission (trademarks@stripe.com).

Sources: [colorfyi.com/brands/stripe](https://colorfyi.com/brands/stripe), [designpieces.com Stripe palette](https://www.designpieces.com/palette/stripe-color-palette-hex-and-rgb/), [fontalternatives.com on Söhne](https://fontalternatives.com/inspiration/stripe-sohne/), [kombai.com Stripe design system](https://kombai.com/examples/design-systems/stripe-kombai), [Stripe Marks Usage Terms](https://stripe.com/it-es/marks/legal).

## Dark variant

For dark glass over a dark backdrop (a night photo, or `make_mesh.py --band 1 --canvas "#0a2540"`), replace the THEME tokens with these:

```css
:root{
  color-scheme:dark;
  --page:#0A1A2F; --scrim:linear-gradient(180deg,rgba(6,14,26,.55),rgba(6,14,26,.72));
  --strong:#FFFFFF; --ink:#E6EBF1; --mute:#A3ACB9; --mute-faint:rgba(163,172,185,.7); --hero-ink:#FFFFFF;
  --accent:#8C85FF; --on-accent:#FFFFFF; --label:#C1C9D2;
  --c1:#6EC3F4; --c2:#FF7AC6; --c3:#3ECF8E; --alert:#FF6B81;
  --glass:rgba(255,255,255,.09); --glass-accent:rgba(140,133,255,.14); --glass-quiet:rgba(255,255,255,.06);
  --glass-low:rgba(255,255,255,.06); --glass-hi:rgba(255,255,255,.14); --field:rgba(255,255,255,.08);
  --chrome:rgba(6,14,26,.6); --hair:rgba(255,255,255,.10); --hair-faint:rgba(255,255,255,.06);
  --edge-glow:rgba(255,255,255,.8); --shadow:none; --shadow-lg:0 10px 40px rgba(0,0,0,.45);
}
```
On dark, glass tints drop to white at .06–.14 alpha, shadows go away, and the rim light turns white.

## Making a new theme

1. Pick the backdrop: brand colours with `make_mesh.py --colors … --canvas …`, or a photo with `make_blur.py`.
2. Set `--strong`/`--ink`/`--mute` to read on a box, and `--hero-ink` to read on the brightest part of the backdrop behind the headline.
3. One `--accent`. Three series colours that differ from each other and from `--accent` and `--alert`.
4. Light themes: white tints at .6–.9 alpha, shadows on. Dark themes: white tints at .06–.14, shadows off.
