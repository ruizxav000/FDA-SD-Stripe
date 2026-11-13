# Themes

Every colour, font, radius and shadow is a token in the `:root` THEME block of `assets/template.html`. Components read only tokens, so a theme is just a different THEME block plus a matching scene (`bg.jpg` + `bg-blur.jpg`).

## Token roles

| Token | Role |
|---|---|
| `--page`, `--page-grad` | canvas behind everything (shows before the scene loads) |
| `--scrim` | wash over the scene to calm it under text |
| `--chrome`, `--chrome-touch` | nav tint once scrolled (desktop / touch) |
| `--menu` | opaque `<option>` background |
| `--tooltip`, `--tooltip-ink`, `--tooltip-mute` | tooltip and toast surface + text |
| `--strong` | titles, big numbers |
| `--ink`, `--ink-soft` | body text, secondary body text |
| `--mute`, `--mute-faint` | meta text, placeholders, faint labels |
| `--hero-ink` | text sitting directly on the scene (brand, tabs, headline) |
| `--on-accent` | text on a filled accent (buttons, done checks) |
| `--accent` | action colour: primary buttons, section headings, focus, "soon" |
| `--label` | small-caps labels |
| `--c1`, `--c2`, `--c3` | identity colours for owners / chart series; `--c3` doubles as success |
| `--alert` | late, over budget, errors |
| `--glass`, `--glass-hi`, `--glass-quiet` | card tints (default, hover/emphasis, quiet) |
| `--glass-low` | faint fill for hover states, chips, tracks |
| `--tint-accent(-hi)`, `--tint-c1` | coloured card tints |
| `--hair`, `--hair-faint` | borders and row dividers |
| `--field`, `--field-focus`, `--track` | inputs and bar tracks |
| `--tab-on` | current-tab background |
| `--edge-glow` | the pointer-following rim light |
| `--shadow`, `--shadow-lg`, `--focus-ring` | elevation and focus |
| `--pill-fill`, `--pill-text`, `--pill-text-base` | badge recipe (tinted vs solid) |
| `--r-card`, `--r-ctl`, `--r-btn` | radii |
| `--f-body`, `--f-brand`, `--f-deck`, `--f-mono`, `--w-body`, `--w-display` | type |

## The Stripe-inspired theme (default)

What the template takes from Stripe's public look, and where the values came from. Palette values are from third-party breakdowns of stripe.com plus Stripe's widely published defaults; they're close, not official. Check them against the live site before treating them as exact.

- **Colour.** Blurple `#635BFF` is the single action colour. Navy `#0A2540` for headings and big numbers, `#425466` slate for secondary text, `#F6F9FC` page, `#E3E8EE` tracks and borders. Body text `#30313D`, link/info blue `#0570DE`, danger `#DF1B41`. Some analyses report the current primary as `#533AFD`; `#635BFF` is the long-standing value.
- **The mesh.** Stripe's hero is a flowing gradient (magenta `#EF008F`, sky `#6EC3F4`, violet `#7038FF`, amber `#FFBA27`) in a band across the top whose bottom edge is skewed. `scripts/make_mesh.py` reproduces it as a static image (defaults: those four colours, band 0.46 of the height, -12° skew, seed 5).
- **Type.** Stripe sets Söhne (licensed) light and large for headlines, regular for body, with Source Code Pro for code. The template uses Inter 300/400/600 with `ss01` + `cv11` as the free stand-in, and Source Code Pro for mono.
- **Depth.** Soft, layered, blue-grey shadows (`rgba(50,50,93,…)` over `rgba(0,0,0,…)`) instead of borders on cards. Tooltips and toasts are dark navy.
- **Shape.** Pill-shaped CTAs, 8px controls, 12px cards.
- **Badges.** Light tinted fill with coloured text, not solid fills.

### Brand-use rules
- Don't use Stripe's logo, wordmark or name as the page's brand, and don't make a page that passes as Stripe's own (no "Stripe Dashboard" titles, no copied product UI). Stripe's Marks Usage Terms allow noting that you use Stripe; anything beyond that needs permission (trademarks@stripe.com).
- Fine: linking to docs.stripe.com, naming Stripe objects and events in content (PaymentIntent, `payment_intent.succeeded`), and "Payments by Stripe" style attribution.

Sources: [colorfyi.com/brands/stripe](https://colorfyi.com/brands/stripe), [designpieces.com Stripe palette](https://www.designpieces.com/palette/stripe-color-palette-hex-and-rgb/), [fontalternatives.com on Söhne](https://fontalternatives.com/inspiration/stripe-sohne/), [kombai.com Stripe design system](https://kombai.com/examples/design-systems/stripe-kombai), [Stripe Marks Usage Terms](https://stripe.com/it-es/marks/legal).

## Alternate: the original dark "redwoods" theme

The template was distilled from a dark page: warm-white ink over a forest photo, gold actions, fog/rose/fern identity colours, Jost body, Bodoni Moda italic brand and Cormorant Garamond italic credit line. To use it, set these tokens and run `scripts/make_blur.py` on a dark landscape photo (rename it `bg.jpg`):

```css
:root{
  color-scheme:dark;
  --page:#0D1610; --page-grad:linear-gradient(150deg,#0E1C14 0%,#17201A 55%,#261B12 100%);
  --scrim:linear-gradient(180deg,rgba(8,13,9,.64) 0%,rgba(8,13,9,.76) 100%);
  --chrome:rgba(9,15,10,.58); --chrome-touch:rgba(9,15,10,.95); --menu:#1A2219;
  --tooltip:rgba(7,12,8,.9); --tooltip-ink:#FFFFFF; --tooltip-mute:#BDBCA6;
  --strong:#FFFFFF; --ink:#F2F0E6; --ink-soft:rgba(242,240,230,.78);
  --mute:#BDBCA6; --mute-faint:rgba(189,188,166,.6); --on-accent:#17150D; --hero-ink:#FFFFFF;
  --accent:#F2C46D; --label:#D7CBA2; --c1:#A3C6D6; --c2:#EEA79C; --c3:#AFD38E; --alert:#FF9C86;
  --glass:rgba(255,255,255,.09); --glass-hi:rgba(255,255,255,.13); --glass-low:rgba(255,255,255,.06); --glass-quiet:rgba(255,255,255,.07);
  --tint-accent:rgba(242,196,109,.11); --tint-accent-hi:rgba(242,196,109,.16); --tint-c1:rgba(163,198,214,.12);
  --hair:rgba(255,255,255,.08); --hair-faint:rgba(255,255,255,.05);
  --field:rgba(255,255,255,.08); --field-focus:rgba(255,255,255,.12); --track:rgba(255,255,255,.12);
  --tab-on:rgba(255,255,255,.15); --edge-glow:rgba(255,255,255,.85);
  --shadow:none; --shadow-lg:0 10px 40px rgba(0,0,0,.45); --focus-ring:none;
  --pill-fill:100%; --pill-text:0%; --pill-text-base:#17150D;   /* solid badges */
  --r-card:14px; --r-ctl:8px; --r-btn:9px;
  --f-body:"Jost",system-ui,sans-serif; --f-brand:"Bodoni Moda",Didot,Georgia,serif;
  --f-deck:"Cormorant Garamond",Georgia,serif; --f-mono:"DM Mono",ui-monospace,monospace;
  --w-body:300; --w-display:300;
}
.brand{font-style:italic;font-weight:500;letter-spacing:.01em}
.hero-deck{font-style:italic;font-weight:500;color:var(--label);opacity:1}
```
Fonts link: `family=Bodoni+Moda:ital,opsz,wght@1,6..96,500&family=Cormorant+Garamond:ital,wght@1,500;1,600&family=DM+Mono:wght@400&family=Jost:wght@300;400;500;600`.

## Making a new theme

1. Pick the scene: a brand gradient (`make_mesh.py --colors … --canvas …`) or a photo (`make_blur.py`). Light canvas → light theme, dark photo → dark theme.
2. Set `--strong`/`--ink`/`--mute` for contrast against a *card*, and `--hero-ink` for contrast against the *scene* (check the brightest part of the scene behind the headline).
3. One `--accent`. Three identity colours that are distinguishable from each other and from `--accent` and `--alert`, and readable as text on the card tint (pill selects use them as text).
4. Light themes: glass tints are white at .66–.92 alpha, shadows on, badges tinted. Dark themes: glass tints are white at .06–.13, shadows off, badges solid.
5. Screenshot the Overview and Dashboard at 1360px and 390px and look at the section headings that sit nearest the scene's edge; that's where contrast fails first. Pull the mesh band up (`--band`) or strengthen `--scrim` if they're hard to read.
