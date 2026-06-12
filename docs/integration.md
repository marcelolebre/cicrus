# Integrating Cicrus

Cicrus is plain CSS + design tokens — no build step, no framework lock-in. It drops
into any stack that can serve a stylesheet.

## 1. Load the stylesheet

```html
<link rel="stylesheet" href="path/to/src/cicrus.css">
```

`cicrus.css` is a barrel that `@import`s, in ITCSS order:

```
tokens.css      → design tokens (settings)        ← edit values here
base.css        → reset + element defaults
components.css  → .c-* UI components
dataviz.css     → .c-* Tufte data graphics
motion.css      → opt-in animation layer
content.css     → .doc-* long-form content
liquid.css      → liquid-glass mode (body.liquid)
utilities.css   → single-purpose helpers
```

Prefer to ship one file or skip a layer? Import the parts you want directly instead
of the barrel — e.g. tokens + components only (liquid.css must load after every
layer it themes).

For production, concatenate/minify the eight files in barrel order (any bundler, or
`npm run build`). The `@import`s are authoring conveniences, not a runtime
requirement.

## 2. Pick a mode

Dark is the default. Two alternates, both first-class:

```html
<body> … </body>                <!-- dark (default) -->
<body class="light"> … </body>  <!-- light -->
<body class="liquid"> … </body> <!-- liquid glass -->
```

**Light** is a parallel theme, not a derivation — a printed manual to dark's OLED panel.

**Liquid** is a true *Liquid Glass* material (iOS 26 / macOS Tahoe reference): it has
**no color of its own**. Panes are milky white films — `rgba(255,255,255,0.10–0.18)` —
that frost whatever sits behind them, with a specular top edge and an edge ring; the
backdrop supplies the color, the material supplies the frost, and `saturate(200%)`
keeps that color glowing through instead of going gray. Two rendering contexts:
**native** (`body.liquid.native`) — the window is transparent, OS vibrancy supplies a
blurred desktop, the page paints only a faint veil (see `platform-mapping.md` §4) —
and **browser** (default), where nothing exists behind a tab so the page keeps an
opaque base + painted backdrop as a *fallback* (never animate it; animated color
fields read as objects behind the glass, not as the glass). Floor discipline: the
body is the floor — full-bleed wrappers must stay `background: transparent` in liquid
or they occlude the glass; only true surfaces (inputs, chips, thumbnails) carry
`--surface-raised` fills; modals are the exception and use heavy occluding glass
(`--glass-heavy-fill` + blur). Token caveats: `--black` doubles as ink-on-light and
must never go transparent — fix occlusions at the usage; surfaces reading
`var(--surface)` go glass for free, hardcoded fills don't (always reference tokens).
Liquid is the one mode that softens radius (16px cards / 12px technical); dark and
light keep the 8px/4px console geometry. Browsers without `backdrop-filter` get
near-opaque panes automatically. Blur applies to standalone surfaces only — never
small atoms, and never a second pass on nested surfaces.

To let users toggle and persist their choice without a flash on reload, apply the
class before the first frame paints — an inline script immediately inside `<body>`
runs before layout:

```html
<body>
  <script>
    // first thing inside <body> — runs before first paint
    var m = localStorage.getItem('mode');           // 'light' | 'liquid' | null (dark)
    if (m === 'light' || m === 'liquid') document.body.classList.add(m);
  </script>
  …
  <script>
    function setMode(m) {                            // 'dark' | 'light' | 'liquid'
      document.body.classList.remove('light', 'liquid');
      if (m !== 'dark') document.body.classList.add(m);
      localStorage.setItem('mode', m);
    }
  </script>
</body>
```

(If you render server-side, prefer emitting `<body class="light">` directly.) Use
whatever storage key your app prefers; the design system doesn't reserve one.

## 3. Use tokens, never raw values

Build everything from the token variables so both modes and future retheming come for
free:

```css
.my-widget {
  background: var(--surface);
  color: var(--text-primary);
  padding: var(--space-md);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
}
```

Don't hardcode hex that might differ per mode. If you need a new semantic color, add it
to **all three** mode blocks in `tokens.css` (`body`, `body.light`, `body.liquid`) —
never a one-off literal. Promote a value to a token once it's used in 3+ places.

## 4. Compose with `.c-*` / `.doc-*`

Reach for shipped classes before writing your own (see [`components.md`](./components.md)).
For app-specific widgets, add your own prefixed namespace (`.app-*`, `.x-*`) that
*consumes* Cicrus tokens — keep `.c-*` for the shared library so upgrades stay clean.

## 5. Machine-readable tokens

[`../tokens.json`](../tokens.json) mirrors `tokens.css` in a
[W3C DTCG](https://www.w3.org/community/design-tokens/)-style shape (per-mode values
keyed `dark`/`light`/`liquid` inside `$value` — DTCG-compatible, not strictly
conformant, since DTCG has no mode axis) — feed it to Style
Dictionary, a Tailwind config generator, or an agent that needs the values and the
"why" behind each role. It is the source of truth for tooling; `tokens.css` is the
source of truth for the browser. Keep them in sync.

## 6. Fonts

Three Google Fonts, loaded by `tokens.css`: **Space Grotesk** (body), **Space Mono**
(labels/data), **Doto** (hero display). All are open-licensed (SIL OFL). For offline /
air-gapped operation — or to avoid a third-party font CDN entirely (a GDPR
consideration for EU-facing deployments) — self-host them and replace the `@import`
at the top of `tokens.css` with local `@font-face` rules.

## 7. Accessibility

Every text role clears WCAG AA on its intended background (ratios in
[`tokens.md`](./tokens.md) §2) — including `--text-disabled` (4.7–6.5:1 per mode),
so meta text and placeholders are safe. If you introduce new color pairings, verify
contrast. Liquid caveat: in the native context the OS desktop is unbounded — keep it
mid-tone or darker, or put a contrast plate behind text-dense panes (see the note in
`tokens.css`).
