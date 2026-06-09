# Cicrus

A monochromatic, typography-first design system for operator consoles, dashboards, and
internal tools — *not* marketing pages. Dark and light modes are both first-class. Plain
CSS + design tokens: no build step, no framework.

> Subtract, don't add. Structure is ornament. Color is an event.

## Install

```bash
npm install cicrus
```

```html
<!-- via npm -->
<link rel="stylesheet" href="node_modules/cicrus/src/cicrus.css">
<!-- or via CDN, no install -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cicrus/src/cicrus.css">
```

No build step. Or just **vendor** `src/` into your project — the `@import`s resolve at
load time. To ship a single file, run `npm run build` → `cicrus.bundle.css`.

## Quick start

```html
<link rel="stylesheet" href="src/cicrus.css">

<body><!-- dark by default; add class="light" for light mode -->
  <main class="c-view">
    <header class="c-view-header">
      <h1 class="c-view-title">Dashboard</h1>
      <span class="c-view-meta">LR:58</span>
    </header>
    <button class="c-btn c-btn--primary">Run</button>
  </main>
</body>
```

That single import pulls the whole system. See [`docs/integration.md`](./docs/integration.md)
for modes, theming, fonts, and bundling.

## Using it with an AI agent

Building with Claude or another coding agent? Point it at **[`AGENTS.md`](./AGENTS.md)** —
the agent entry point. Two machine-readable indexes make components discoverable without
guesswork: [`cicrus.components.json`](./cicrus.components.json) (every component → its
classes + a copy-pasteable snippet) and [`tokens.json`](./tokens.json) (all design tokens,
W3C DTCG).

## Structure

```
cicrus/
├── package.json          ← npm + CDN install
├── AGENTS.md             ← entry point for AI agents
├── src/                  ← the library (import this)
│   ├── cicrus.css          single-import barrel (ITCSS)
│   ├── tokens.css          design tokens — dark + light
│   ├── base.css            reset + element defaults
│   ├── components.css      .c-* UI components
│   ├── content.css         .doc-* long-form content
│   ├── utilities.css       single-purpose helpers
│   └── glyphs.js           optional animated state glyphs
├── tokens.json           ← machine-readable tokens (W3C DTCG)
├── cicrus.components.json← machine-readable component index (for agents)
├── docs/                 ← read these
│   ├── SKILL.md            the full design brief
│   ├── tokens.md           token reference (+ WCAG ratios)
│   ├── components.md       every class, matched to the CSS
│   ├── patterns.md         screen-level compositions
│   ├── integration.md      wiring it into your stack
│   ├── glyphs.md  data-graphics.md  schematics.md  platform-mapping.md
└── examples/             ← see it run
    ├── component-index.html      catalog of everything
    ├── starter.html              copy-pasteable single file
    ├── dashboard.html  article.html  chat.html  operator-console.html
    └── previews/                 one file per component
        ├── ui/  content/  cards/
```

## Principles

1. **Three layers per screen** — primary / secondary / tertiary. If two elements
   compete, one shrinks, fades, or moves.
2. **Font budget** — 2 families, 3 sizes, 2 weights. Space Grotesk + Space Mono; Doto
   for hero moments only.
3. **Monochrome is the canvas** — color encodes status, never decoration. Red is an
   interrupt, not a palette.
4. **Both modes first-class** — dark = OLED panel, light = printed manual. Neither
   derived from the other.
5. **Labels are instrument labels** — Space Mono, ALL CAPS, ~11px, 0.08em tracking.
6. **Accessibility is craft** — every text color clears WCAG AA on its background.

Full rationale, craft rules, and anti-patterns: [`docs/SKILL.md`](./docs/SKILL.md).

## License

[MIT](./LICENSE). Fonts are SIL OFL, loaded from Google Fonts (self-host for offline use).
Contributions welcome — see [`CONTRIBUTING.md`](./CONTRIBUTING.md).
