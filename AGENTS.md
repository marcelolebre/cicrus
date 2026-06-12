# Cicrus for agents

You are an AI agent and a project wants to use **Cicrus** components. This file is your
entry point: it tells you how to install Cicrus, where the machine-readable indexes are,
and how to drop a component in correctly. Read it top to bottom before writing markup.

Cicrus is a **monochromatic, typography-first CSS design system** for operator consoles,
dashboards, and internal tools — plain CSS + design tokens, no build step, no framework.
Three first-class modes: **dark** (default), **light** (`body.light`), and **liquid glass**
(`body.liquid` — milky films frosting whatever sits behind them).

## 1. Install it into the host project

Pick whichever fits the project. All three give you the same `src/cicrus.css`.

```bash
# npm — recommended for projects with a package manager
npm install cicrus
```
```html
<!-- node_modules -->
<link rel="stylesheet" href="node_modules/cicrus/src/cicrus.css">
<!-- or CDN, no install -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cicrus/src/cicrus.css">
```

Or **vendor** the files: copy `src/` (and `tokens.json` if you read tokens) into the
project. No build is required — the `@import`s in `cicrus.css` resolve at load time.

One import pulls the whole system (ITCSS order: tokens → base → components → dataviz →
motion → content → liquid → utilities). To ship one file, run `npm run build` (concatenates the eight layers into
`cicrus.bundle.css`) or import a single layer from `package.json` `exports`.

## 2. The two machine-readable indexes — read these, don't guess

| File | What it gives you |
|------|-------------------|
| [`cicrus.components.json`](./cicrus.components.json) | Every component: `id`, `title`, the exact CSS `classes` it uses, and a `preview` path to a **self-contained, copy-pasteable HTML snippet**. This is your component catalog — query it instead of inventing class names. |
| [`tokens.json`](./tokens.json) | Every design token (DTCG-style) — colors, spacing, radii, type, motion, glass — for all three modes, with the "why" per role. Use token vars (`var(--text-primary)`), never raw hex. |

Prose references for humans and deeper context:
[`docs/components.md`](./docs/components.md) (class-by-class), [`docs/tokens.md`](./docs/tokens.md),
[`docs/SKILL.md`](./docs/SKILL.md) (the full design brief + anti-patterns),
[`docs/integration.md`](./docs/integration.md) (modes, theming, bundling),
[`docs/patterns.md`](./docs/patterns.md), [`docs/data-graphics.md`](./docs/data-graphics.md)
(Tufte data-viz rules), [`docs/motion.md`](./docs/motion.md) (when and how things move),
[`docs/glyphs.md`](./docs/glyphs.md) (the animated status mark + `mountGlyph` API).

## 3. How to use a component

1. Look it up in `cicrus.components.json` (search by `title` or `id`).
2. Open its `preview` file — e.g. `examples/previews/content/callout-tip.html`. Each
   preview is a full standalone page; the markup you want is **inside `<body>`**.
3. Copy that body markup into the host page. Keep the `class` attributes verbatim — they
   are the contract with the CSS.
4. Make sure `src/cicrus.css` is linked once on the page (step 1).

Snippets live under `examples/previews/{cards,ui,content,dataviz,motion,modes}/`.
`cards/` = design-system showcase, `ui/` = application primitives (`.c-*`), `content/` =
long-form/document primitives (`.doc-*`), `dataviz/` = Tufte data graphics, `motion/` =
the animation layer, `modes/` = liquid glass. Full demo screens (dashboard, article,
chat, console) are in `examples/`. The animated status mark is a JS module:
`import { mountGlyph } from 'cicrus/glyphs'` → `mountGlyph(el, { state: 'running' })`
with states `running` / `stopped` / `broken`.

## 4. Non-negotiable rules

- **Load the fonts.** `tokens.css` `@import`s Space Grotesk + Space Mono + Doto from
  Google Fonts. If the project is offline/self-hosted, vendor them — don't silently fall
  back to system fonts; the type *is* the design.
- **Dark is the default; `class="light"` / `class="liquid"` on `<body>` switch modes.**
  None is derived from another — don't synthesize a theme by inverting colors. In liquid,
  the body is the floor: keep full-bleed wrappers `background: transparent`, never paint
  a surface's own color (the backdrop supplies color, the material supplies frost).
- **Color encodes status, never decoration.** Red (`--accent`/`--error`) is an interrupt.
  Don't add brand colors or fills to badges — they are border-only.
- **Use tokens, not literals.** Every color/space/size has a `var(--…)`. Never hardcode a
  hex value; never invent a token.
- **Three layers per screen** — one primary focus, secondary support, tertiary labels. If
  two elements compete, one must shrink, fade, or move.
- **`.c-*` is UI, `.doc-*` is long-form content.** They don't collide; pick the namespace
  that matches the surface.
- **Motion goes through tokens** — `var(--ease)` + `var(--dur-micro|switch|view|data)`,
  entrances gated on `prefers-reduced-motion: no-preference`. Use the shipped `.c-rise` /
  `.c-stagger` / `.c-data-enter` classes instead of writing keyframes.

When in doubt, prefer subtraction. See `docs/SKILL.md` for the complete craft rules.
