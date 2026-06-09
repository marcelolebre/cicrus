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
content.css     → .doc-* long-form content
utilities.css   → single-purpose helpers
```

Prefer to ship one file or skip a layer? Import the parts you want directly instead
of the barrel — e.g. tokens + components only.

For production, concatenate/minify the five files (any bundler, or `cat`). The
`@import`s are authoring conveniences, not a runtime requirement.

## 2. Pick a mode

Dark is the default. Light is a parallel theme, not a derivation — add `class="light"`
to `<body>`:

```html
<body class="light"> … </body>
```

To let users toggle and persist their choice without a flash on reload, set the class
before first paint:

```html
<head>
  <script>
    // run before CSS paints
    if (localStorage.getItem('mode') === 'light') document.documentElement.dataset.mode = 'light';
  </script>
</head>
<body class="{{ mode }}"> … </body>
<script>
  function setMode(m){ document.body.classList.toggle('light', m === 'light');
    localStorage.setItem('mode', m); }
</script>
```

Use whatever storage key your app prefers; the design system doesn't reserve one.

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
to **both** the dark (`body`) and light (`body.light`) blocks in `tokens.css` — never a
one-off literal. Promote a value to a token once it's used in 3+ places.

## 4. Compose with `.c-*` / `.doc-*`

Reach for shipped classes before writing your own (see [`components.md`](./components.md)).
For app-specific widgets, add your own prefixed namespace (`.app-*`, `.x-*`) that
*consumes* Cicrus tokens — keep `.c-*` for the shared library so upgrades stay clean.

## 5. Machine-readable tokens

[`../tokens.json`](../tokens.json) mirrors `tokens.css` in
[W3C DTCG](https://www.w3.org/community/design-tokens/) format — feed it to Style
Dictionary, a Tailwind config generator, or an agent that needs the values and the
"why" behind each role. It is the source of truth for tooling; `tokens.css` is the
source of truth for the browser. Keep them in sync.

## 6. Fonts

Three Google Fonts, loaded by `tokens.css`: **Space Grotesk** (body), **Space Mono**
(labels/data), **Doto** (hero display). All are open-licensed (SIL OFL). For offline /
air-gapped operation, self-host them and replace the `@import` at the top of
`tokens.css` with local `@font-face` rules.

## 7. Accessibility

Every text role clears WCAG AA on its intended background (ratios in
[`tokens.md`](./tokens.md) §2). If you introduce new color pairings, verify contrast —
`--text-disabled` (~3:1) is for non-content only (placeholders, disabled controls).
