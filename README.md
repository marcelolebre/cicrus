# Cicrus Design System

An operator-console design system. Monochromatic canvas, typography-first hierarchy, dark and light modes both first-class. Built for dashboards, internal tools, and control-surface UIs — not marketing pages.

> Subtract, don't add. Structure is ornament. Color is an event.

---

## Source

Carved out of [github.com/marcelolebre/cicrus](https://github.com/marcelolebre/cicrus). The full skill brief, token reference, component catalog, and patterns live under `references/`. The drop-in stylesheets are `colors_and_type.css` (tokens) and `cicrus.css` (component classes).

## Manifest

| Path | Purpose |
|------|---------|
| `colors_and_type.css` | Drop-in token block — fonts, colors (dark + light), spacing, radii. Imports Google Fonts. |
| `cicrus.css` | `.c-*` component classes — view shell, badges, buttons, kanban, timeline, etc. |
| `cards/` | Per-token + per-component preview cards. Surfaced in the Design System pane. |
| `references/SKILL.md` | The full design brief — read first. |
| `references/tokens.md` | Complete token reference. |
| `references/components.md` | Every component pattern with HTML + CSS. |
| `references/patterns.md` | Screen-level compositions. |
| `references/glyphs.md` | Animated state glyphs (idle / thinking / error). |
| `assets/cicrus-glyphs.js` | Pixel-grid canvas renderer for the glyphs. |

## Quick start

```html
<link rel="stylesheet" href="colors_and_type.css">
<link rel="stylesheet" href="cicrus.css">

<body>  <!-- default = dark; add class="light" for light mode -->
  <main class="c-view">
    <header class="c-view-header">
      <h1 class="c-view-title">Dashboard</h1>
      <span class="c-caps">LR:58</span>
    </header>
  </main>
</body>
```

## Principles

1. **Three layers per screen** — primary / secondary / tertiary. If two elements compete, one shrinks, fades, or moves.
2. **Font budget** — 2 families, 3 sizes, 2 weights. Space Grotesk + Space Mono. Doto for hero moments only.
3. **Monochrome is the canvas** — color encodes status, never decoration.
4. **Both modes first-class** — dark = OLED panel, light = printed manual. Neither derived from the other.
5. **Labels are instrument labels** — Space Mono, ALL CAPS, ~11px, 0.08em tracking.
6. **Accessibility is craft** — every text color clears WCAG AA on its background.

See `references/SKILL.md` for the long version.
